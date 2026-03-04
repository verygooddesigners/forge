import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSuperAdmin } from '@/lib/super-admin';
import { checkPermissionByKey } from '@/lib/auth';

const getAdmin = () => createAdminClient() as any;

// PATCH /api/bugs/[id] — update status, notes, or archive/unarchive
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canManage = isSuperAdmin(user.email) || await checkPermissionByKey('can_manage_bugs');
    if (!canManage) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { status, admin_notes, archive } = body;

    const updates: Record<string, unknown> = {};

    if (status !== undefined) {
      updates.status = status;
      // Auto-archive when marked completed
      if (status === 'completed') {
        updates.archived_at = new Date().toISOString();
      }
    }
    if (admin_notes !== undefined) {
      updates.admin_notes = admin_notes;
    }
    // Explicit archive / unarchive
    if (archive === true) {
      updates.archived_at = new Date().toISOString();
    } else if (archive === false) {
      updates.archived_at = null;
      // Reset status from 'completed' when restoring
      if (!status) updates.status = 'in_progress';
    }

    const admin = getAdmin();
    const { data, error } = await admin
      .from('beta_feedback')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[bugs PATCH]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/bugs/[id] — permanently delete a bug
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canManage = isSuperAdmin(user.email) || await checkPermissionByKey('can_manage_bugs');
    if (!canManage) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const admin = getAdmin();
    const { error } = await admin
      .from('beta_feedback')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[bugs DELETE]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
