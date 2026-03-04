import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSuperAdmin } from '@/lib/super-admin';
import { checkPermissionByKey } from '@/lib/auth';

const getAdmin = () => createAdminClient() as any;

// GET /api/bugs?tab=active|archive
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isSuper = isSuperAdmin(user.email);
    const canManage = isSuper || await checkPermissionByKey('can_manage_bugs');
    const canView   = canManage || await checkPermissionByKey('can_view_bugs');
    if (!canView) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'active'; // active | archive

    const admin = getAdmin();
    let query = admin
      .from('beta_feedback')
      .select('*')
      .eq('type', 'bug')
      .order('created_at', { ascending: false });

    if (tab === 'archive') {
      query = query.not('archived_at', 'is', null);
    } else {
      query = query.is('archived_at', null);
    }

    // Non-managers only see their own submissions
    if (!canManage) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data, canManage });
  } catch (err: any) {
    console.error('[bugs GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/bugs — submit a new bug report
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isSuper = isSuperAdmin(user.email);
    const canView = isSuper || await checkPermissionByKey('can_view_bugs') || await checkPermissionByKey('can_manage_bugs');
    if (!canView) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { title, description, severity = 'medium', screenshot_url } = body;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const admin = getAdmin();
    const { data, error } = await admin
      .from('beta_feedback')
      .insert({
        user_id: user.id,
        user_email: user.email,
        type: 'bug',
        title: title.trim(),
        description: description.trim(),
        severity,
        status: 'submitted',
        screenshot_url: screenshot_url || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[bugs POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
