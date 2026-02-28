import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSuperAdmin } from '@/lib/super-admin';

// POST /api/beta-feedback — submit a bug report or feature suggestion
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, title, description, screenshot_url } = body;

    if (!type || !['bug', 'feature'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('beta_feedback')
      .insert({
        user_id: user.id,
        user_email: user.email,
        type,
        title: title.trim(),
        description: description.trim(),
        status: 'submitted',
        screenshot_url: screenshot_url ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[beta-feedback POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/beta-feedback — super admin gets all, users get their own
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    if (isSuperAdmin(user.email)) {
      // Super admin: all feedback, newest first
      const { data, error } = await admin
        .from('beta_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ data });
    } else {
      // Regular user: own feedback only
      const { data, error } = await admin
        .from('beta_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ data });
    }
  } catch (err: any) {
    console.error('[beta-feedback GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/beta-feedback — super admin updates status/notes
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isSuperAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('beta_feedback')
      .update({ status, admin_notes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[beta-feedback PATCH]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
