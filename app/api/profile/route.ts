import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, job_title, avatar_url } = body;

    const updatePayload: Record<string, unknown> = {};
    if (full_name !== undefined) updatePayload.full_name = full_name || null;
    if (job_title !== undefined) updatePayload.job_title = job_title || null;
    if (avatar_url !== undefined) updatePayload.avatar_url = avatar_url || null;

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('users')
      .update(updatePayload)
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
