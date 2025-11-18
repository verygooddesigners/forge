import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeWritingStyle } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { model_id, content } = await request.json();

    if (!model_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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

    const isAdmin = userProfile?.role === 'admin';
    const ownsModel = model.strategist_id === user.id;

    if (!isAdmin && !ownsModel) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Analyze writing style
    let analyzedStyle: any = {};
    try {
      analyzedStyle = await analyzeWritingStyle(content);
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

    // Save training content with analysis (no embedding - using Claude-only approach)
    const { error: insertError } = await supabase
      .from('training_content')
      .insert({
        model_id,
        content,
        embedding: null, // Not using embeddings with Claude-only setup
        analyzed_style: analyzedStyle,
      });

    if (insertError) {
      console.error('Error saving training content:', insertError);
      return NextResponse.json(
        { error: 'Failed to save training content' },
        { status: 500 }
      );
    }

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
    console.error('Error in train route:', error);
    const errorMessage = error?.message || 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}


