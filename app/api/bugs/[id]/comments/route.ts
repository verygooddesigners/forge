import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSuperAdmin } from '@/lib/super-admin';
import { checkPermissionByKey } from '@/lib/auth';

const getAdmin = () => createAdminClient() as any;

// GET /api/bugs/[id]/comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = isSuperAdmin(user.email)
      || await checkPermissionByKey('can_view_bugs')
      || await checkPermissionByKey('can_manage_bugs');
    if (!canView) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const admin = getAdmin();
    const { data, error } = await admin
      .from('bug_comments')
      .select('*')
      .eq('bug_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('[bug comments GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/bugs/[id]/comments
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = isSuperAdmin(user.email)
      || await checkPermissionByKey('can_view_bugs')
      || await checkPermissionByKey('can_manage_bugs');
    if (!canView) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { content } = body;
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get user's display name
    const { data: userData } = await (createAdminClient() as any)
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const admin = getAdmin();
    const { data, error } = await admin
      .from('bug_comments')
      .insert({
        bug_id: id,
        user_id: user.id,
        user_email: user.email,
        user_name: userData?.full_name || user.email,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[bug comments POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
