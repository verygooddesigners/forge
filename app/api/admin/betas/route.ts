import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSuperAdmin } from '@/lib/super-admin';

// GET /api/admin/betas — list all betas with their users
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isSuperAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = createAdminClient();
    const { data: betas, error } = await admin
      .from('betas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { data: betaUsers } = await admin
      .from('beta_users')
      .select('*')
      .order('created_at', { ascending: true });

    // Fetch default_writer_model_id for all invited users
    const userIds = (betaUsers ?? []).map(bu => bu.user_id).filter(Boolean);
    const modelByUserId: Record<string, string | null> = {};
    if (userIds.length > 0) {
      const { data: userRows } = await admin
        .from('users')
        .select('id, default_writer_model_id')
        .in('id', userIds);
      for (const row of userRows ?? []) {
        modelByUserId[row.id] = row.default_writer_model_id ?? null;
      }
    }

    const usersByBeta: Record<string, typeof betaUsers> = {};
    for (const bu of betaUsers ?? []) {
      if (!usersByBeta[bu.beta_id]) usersByBeta[bu.beta_id] = [];
      usersByBeta[bu.beta_id]!.push({
        ...bu,
        default_writer_model_id: bu.user_id ? (modelByUserId[bu.user_id] ?? null) : null,
      });
    }

    return NextResponse.json({
      data: betas?.map(b => ({
        ...b,
        users: usersByBeta[b.id] ?? [],
      })),
    });
  } catch (err: any) {
    console.error('[admin/betas GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/betas — create a new beta
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isSuperAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, notes } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('betas')
      .insert({
        name: name.trim(),
        notes: notes?.trim() ?? '',
        created_by: user.email,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: { ...data, users: [] } });
  } catch (err: any) {
    console.error('[admin/betas POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/admin/betas — multi-action updates
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isSuperAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { beta_id, action } = body;
    if (!beta_id || !action) {
      return NextResponse.json({ error: 'beta_id and action are required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // ── Update name ──────────────────────────────────────────────────────────
    if (action === 'update') {
      const updates: Record<string, any> = {};
      if (body.name !== undefined) updates.name = body.name.trim();
      const { error } = await admin.from('betas').update(updates).eq('id', beta_id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // ── Update notes (bumps version) ─────────────────────────────────────────
    if (action === 'update_notes') {
      const { notes, is_major_update } = body;
      // Fetch current version to bump it
      const { data: current } = await admin
        .from('betas')
        .select('notes_version')
        .eq('id', beta_id)
        .single();

      const newVersion = (current?.notes_version ?? 1) + 1;

      const { error } = await admin.from('betas').update({
        notes: notes ?? '',
        notes_version: newVersion,
        notes_is_major_update: !!is_major_update,
      }).eq('id', beta_id);

      if (error) throw error;
      return NextResponse.json({ success: true, notes_version: newVersion });
    }

    // ── Add user ─────────────────────────────────────────────────────────────
    if (action === 'add_user') {
      const { email } = body;
      if (!email?.trim()) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      const { error } = await admin.from('beta_users').insert({
        beta_id,
        email: email.trim().toLowerCase(),
      });

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json({ error: 'User already in this beta' }, { status: 409 });
        }
        throw error;
      }
      return NextResponse.json({ success: true });
    }

    // ── Remove user ──────────────────────────────────────────────────────────
    if (action === 'remove_user') {
      const { email } = body;
      const { error } = await admin
        .from('beta_users')
        .delete()
        .eq('beta_id', beta_id)
        .eq('email', email);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // ── Start beta (send invites) ─────────────────────────────────────────────
    if (action === 'start_beta') {
      const { data: betaUsers } = await admin
        .from('beta_users')
        .select('*')
        .eq('beta_id', beta_id)
        .is('invited_at', null);

      const results: { email: string; success: boolean; error?: string }[] = [];

      for (const bu of betaUsers ?? []) {
        try {
          const { data: inviteData, error: inviteError } =
            await admin.auth.admin.inviteUserByEmail(bu.email, {
              data: { beta_id },
            });

          if (inviteError) throw inviteError;

          const newUserId = inviteData.user?.id ?? null;

          await admin
            .from('beta_users')
            .update({
              invited_at: new Date().toISOString(),
              user_id: newUserId,
            })
            .eq('id', bu.id);

          // Ensure public.users record exists so the user appears in writer model assignment dropdowns
          if (newUserId) {
            await admin.from('users').upsert({
              id: newUserId,
              email: bu.email,
              role: 'strategist',
              account_status: 'confirmed',
            }, { onConflict: 'id', ignoreDuplicates: true });
          }

          results.push({ email: bu.email, success: true });
        } catch (e: any) {
          results.push({ email: bu.email, success: false, error: e.message });
        }
      }

      await admin.from('betas').update({
        status: 'active',
        started_at: new Date().toISOString(),
      }).eq('id', beta_id);

      return NextResponse.json({ success: true, results });
    }

    // ── Resend invite ────────────────────────────────────────────────────────
    if (action === 'resend_invite') {
      const { email } = body;
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

      const { data: inviteData, error: inviteError } =
        await admin.auth.admin.inviteUserByEmail(email, { data: { beta_id } });

      if (inviteError) throw inviteError;

      const resentUserId = inviteData.user?.id ?? null;

      await admin
        .from('beta_users')
        .update({
          invited_at: new Date().toISOString(),
          user_id: resentUserId,
        })
        .eq('beta_id', beta_id)
        .eq('email', email);

      // Ensure public.users record exists so the user appears in writer model assignment dropdowns
      if (resentUserId) {
        await admin.from('users').upsert({
          id: resentUserId,
          email: email,
          role: 'strategist',
          account_status: 'confirmed',
        }, { onConflict: 'id', ignoreDuplicates: true });
      }

      return NextResponse.json({ success: true });
    }

    // ── Assign writer model ───────────────────────────────────────────────────
    if (action === 'assign_writer_model') {
      const { user_id, email: userEmail, writer_model_id } = body;
      if (!user_id) {
        return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
      }

      // Ensure public.users record exists (user may not have logged in yet)
      await admin.from('users').upsert({
        id: user_id,
        email: userEmail ?? '',
        role: 'strategist',
        account_status: 'confirmed',
      }, { onConflict: 'id', ignoreDuplicates: true });

      // Assign (or unassign) the writer model
      const { error } = await admin
        .from('users')
        .update({ default_writer_model_id: writer_model_id ?? null })
        .eq('id', user_id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // ── End beta ─────────────────────────────────────────────────────────────
    if (action === 'end_beta') {
      const { error } = await admin.from('betas').update({
        status: 'ended',
        ended_at: new Date().toISOString(),
      }).eq('id', beta_id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[admin/betas PATCH]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/betas?id=xxx — delete a draft beta only
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isSuperAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const admin = createAdminClient();

    const { data: beta } = await admin.from('betas').select('status').eq('id', id).single();
    if (beta?.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft betas can be deleted' }, { status: 400 });
    }

    const { error } = await admin.from('betas').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/betas DELETE]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
