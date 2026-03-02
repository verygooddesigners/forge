import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { modelId, trainingData } = body;

    if (!modelId || !trainingData) {
      return NextResponse.json(
        { error: 'modelId and trainingData are required' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('writer_model_training_jobs')
      .insert({
        model_id: modelId,
        user_id: user.id,
        training_data: trainingData,
        status: 'queued',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Training error:', error);
    return NextResponse.json({ error: 'Training failed' }, { status: 500 });
  }
}
