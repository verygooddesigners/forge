import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { analyzeWritingStyle, generateWriterEmbeddings } from '@/lib/agents';

export async function POST(request: NextRequest) {
  try {
    console.log('[TRAIN] Training request received');
    const { model_id, content } = await request.json();

    if (!model_id || !content) {
      console.error('[TRAIN] Missing required fields:', { hasModelId: !!model_id, hasContent: !!content });
      return NextResponse.json(
        { error: 'Missing required fields', details: 'model_id and content are required' },
        { status: 400 }
      );
    }

    console.log('[TRAIN] Model ID:', model_id, 'Content length:', content.length);

    const supabase = await createClient();

    // Verify user has permission to train this model
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client for DB operations — RLS blocks user-scoped inserts on training_content
    let admin;
    try {
      admin = createAdminClient();
    } catch (adminErr: any) {
      console.error('[TRAIN] Failed to create admin client:', adminErr.message);
      return NextResponse.json(
        { error: 'Server configuration error', details: 'Admin database client unavailable' },
        { status: 500 }
      );
    }

    // Get the model to check permissions (simple query — no join)
    const { data: model, error: modelError } = await admin
      .from('writer_models')
      .select('*')
      .eq('id', model_id)
      .single();

    if (modelError || !model) {
      console.error('[TRAIN] Model not found:', { model_id, modelError });
      return NextResponse.json({ error: 'Model not found', details: modelError?.message || 'No model with this ID' }, { status: 404 });
    }

    // Check if user can train this model
    const { data: userProfile } = await admin
      .from('users')
      .select('role, default_writer_model_id')
      .eq('id', user.id)
      .single();

    const isManagerOrAbove = userProfile?.role && ['super_admin', 'admin', 'manager'].includes(userProfile.role);
    const ownsModel = model.strategist_id === user.id;
    // Any authenticated user can contribute training content to in-house (shared) models
    const isHouseModel = model.is_house_model === true;
    // Users can train their assigned default model even if strategist_id isn't set
    const isAssignedModel = userProfile?.default_writer_model_id === model_id;

    if (!isManagerOrAbove && !ownsModel && !isHouseModel && !isAssignedModel) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Analyze writing style and generate embeddings in parallel
    // These are non-critical — if they fail or timeout, we still save the content
    let analyzedStyle: any = {};
    let embedding = null;

    try {
      // Run both AI operations in parallel with a 8-second timeout
      const AI_TIMEOUT = 8000;
      const [styleResult, embeddingResult] = await Promise.allSettled([
        Promise.race([
          analyzeWritingStyle({
            samples: [content],
            writerName: model.name || 'Writer',
            existingContext: model.metadata?.style_analysis,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Style analysis timeout')), AI_TIMEOUT)),
        ]),
        Promise.race([
          generateWriterEmbeddings(content),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Embedding generation timeout')), AI_TIMEOUT)),
        ]),
      ]);

      // Process style analysis result
      if (styleResult.status === 'fulfilled') {
        const analysisResponse = styleResult.value as any;
        if (analysisResponse.success && analysisResponse.content) {
          try {
            analyzedStyle = JSON.parse(analysisResponse.content);
          } catch {
            console.warn('[TRAIN] Failed to parse style analysis JSON');
          }
        }
      } else {
        console.warn('[TRAIN] Style analysis failed:', styleResult.reason?.message);
      }

      // Process embedding result
      if (embeddingResult.status === 'fulfilled') {
        const embeddingVector = embeddingResult.value as number[] | null;
        if (embeddingVector && Array.isArray(embeddingVector) && embeddingVector.length === 1536) {
          embedding = embeddingVector;
        } else if (embeddingVector) {
          console.warn('[TRAIN] Embedding dimension mismatch:', (embeddingVector as any).length);
        }
      } else {
        console.warn('[TRAIN] Embedding generation failed:', embeddingResult.reason?.message);
      }
    } catch (aiError: any) {
      console.warn('[TRAIN] AI processing error (non-critical):', aiError?.message);
      // Continue with defaults — the content will still be saved
    }

    // Save training content with analysis and embeddings
    const { error: insertError } = await admin
      .from('training_content')
      .insert({
        model_id,
        content,
        embedding,
        analyzed_style: analyzedStyle,
      });

    if (insertError) {
      console.error('[TRAIN] Error saving training content:', JSON.stringify(insertError));
      return NextResponse.json(
        { error: 'Failed to save training content', details: insertError.message, code: insertError.code },
        { status: 500 }
      );
    }

    console.log('[TRAIN] Training content saved successfully');

    // Update model metadata with new count
    const { count: contentCount, error: countError } = await admin
      .from('training_content')
      .select('id', { count: 'exact', head: true })
      .eq('model_id', model_id);

    if (countError) {
      console.error('Error counting training content:', countError);
    }

    const newCount = contentCount || 0;

    // Update the model with the new count
    const { error: updateError } = await admin
      .from('writer_models')
      .update({
        metadata: {
          ...(model.metadata || {}),
          total_training_pieces: newCount,
        },
      })
      .eq('id', model_id);

    if (updateError) {
      console.error('Error updating writer model:', updateError);
      return NextResponse.json(
        { error: 'Failed to update model metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analyzed_style: analyzedStyle,
      training_count: newCount,
    });
  } catch (error: any) {
    console.error('[TRAIN] Fatal error in train route:', error);
    console.error('[TRAIN] Error stack:', error?.stack);
    const errorMessage = error?.message || 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to add training content',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
