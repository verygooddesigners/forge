import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    // Get the model to check permissions
    const { data: model, error: modelError } = await supabase
      .from('writer_models')
      .select('*, users!writer_models_strategist_id_fkey(role)')
      .eq('id', model_id)
      .single();

    if (modelError || !model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Check if user can train this model
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isManagerOrAbove = userProfile?.role && ['super_admin', 'admin', 'manager'].includes(userProfile.role);
    const ownsModel = model.strategist_id === user.id;

    if (!isManagerOrAbove && !ownsModel) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Analyze writing style using Writer Training Agent
    let analyzedStyle: any = {};
    try {
      const analysisResponse = await analyzeWritingStyle({
        samples: [content],
        writerName: model.name || 'Writer',
        existingContext: model.metadata?.style_analysis,
      });
      
      if (analysisResponse.success && analysisResponse.content) {
        try {
          analyzedStyle = JSON.parse(analysisResponse.content);
        } catch {
          // If parse fails, use default
          analyzedStyle = {
            tone: 'professional',
            voice: 'active',
            vocabulary_level: 'intermediate',
            sentence_structure: 'varied',
            key_phrases: [],
          };
        }
      }
    } catch (styleError: any) {
      console.error('Error analyzing writing style:', styleError);
      // Return a default style if analysis fails
      analyzedStyle = {
        tone: 'professional',
        voice: 'active',
        vocabulary_level: 'intermediate',
        sentence_structure: 'varied',
        key_phrases: [],
      };
    }

    // Generate embeddings using Writer Training Agent (if configured)
    let embedding = null;
    try {
      const embeddingVector = await generateWriterEmbeddings(content);
      if (embeddingVector) {
        embedding = embeddingVector;
      }
    } catch (embeddingError) {
      console.warn('Error generating embeddings:', embeddingError);
      // Continue without embeddings
    }

    // Save training content with analysis and embeddings
    const { error: insertError } = await supabase
      .from('training_content')
      .insert({
        model_id,
        content,
        embedding,
        analyzed_style: analyzedStyle,
      });

    if (insertError) {
      console.error('[TRAIN] Error saving training content:', insertError);
      return NextResponse.json(
        { error: 'Failed to save training content', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('[TRAIN] Training content saved successfully');

    // Update model metadata with new count
    const { count: contentCount, error: countError } = await supabase
      .from('training_content')
      .select('id', { count: 'exact', head: true })
      .eq('model_id', model_id);

    if (countError) {
      console.error('Error counting training content:', countError);
    }

    const newCount = contentCount || 0;

    // Update the model with the new count
    const { error: updateError } = await supabase
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


