import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { betaId, feedback, rating } = body;

    if (!betaId || !feedback) {
      return NextResponse.json({ error: 'betaId and feedback are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('beta_feedback')
      .insert({ beta_id: betaId, user_id: user.id, feedback, rating })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Beta feedback error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
