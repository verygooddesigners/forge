import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/beta-notes — get current user's active beta notes + membership
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null });

    const admin = createAdminClient();

    // Find active beta membership by user_id or email
    const { data: membership } = await admin
      .from('beta_users')
      .select('*, betas(*)')
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .not('betas', 'is', null)
      .limit(1)
      .single();

    if (!membership || !membership.betas) {
      return NextResponse.json({ data: null });
    }

    const beta = membership.betas as Record<string, any>;
    if (beta.status !== 'active') {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({
      data: {
        beta: {
          id: beta.id,
          name: beta.name,
          notes: beta.notes,
          notes_version: beta.notes_version,
          notes_is_major_update: beta.notes_is_major_update,
          status: beta.status,
        },
        membership: {
          id: membership.id,
          acknowledged_at: membership.acknowledged_at,
          last_seen_notes_version: membership.last_seen_notes_version,
        },
      },
    });
  } catch (err: any) {
    console.error('[beta-notes GET]', err);
    return NextResponse.json({ data: null });
  }
}

// PATCH /api/beta-notes — acknowledge notes or mark major update as seen
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { membership_id, action } = await req.json();
    if (!membership_id || !action) {
      return NextResponse.json({ error: 'membership_id and action required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const updates: Record<string, any> = {};

    if (action === 'acknowledge') {
      updates.acknowledged_at = new Date().toISOString();
      // Also mark notes version as seen
      const { data: bu } = await admin
        .from('beta_users')
        .select('betas(notes_version)')
        .eq('id', membership_id)
        .single();
      const notesVersion = (bu?.betas as any)?.notes_version ?? 1;
      updates.last_seen_notes_version = notesVersion;
    } else if (action === 'seen') {
      const { data: bu } = await admin
        .from('beta_users')
        .select('betas(notes_version)')
        .eq('id', membership_id)
        .single();
      const notesVersion = (bu?.betas as any)?.notes_version ?? 1;
      updates.last_seen_notes_version = notesVersion;
    }

    const { error } = await admin
      .from('beta_users')
      .update(updates)
      .eq('id', membership_id)
      .or(`user_id.eq.${user.id},email.eq.${user.email}`);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[beta-notes PATCH]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
