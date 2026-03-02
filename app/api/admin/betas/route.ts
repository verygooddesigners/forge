import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: betas, error } = await supabase
      .from('beta_programs')
      .select('*, beta_enrollments(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(betas);
  } catch (error) {
    console.error('Failed to fetch betas:', error);
    return NextResponse.json({ error: 'Failed to fetch betas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('beta_programs')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create beta:', error);
    return NextResponse.json({ error: 'Failed to create beta' }, { status: 500 });
  }
}
