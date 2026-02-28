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

    // ── Shared helper: create/find auth account + ensure public.users row + get reset link ──
    const provisionUser = async (email: string): Promise<{ userId: string; resetLink?: string }> => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://forge.gdcgroup.com';

      // 1. Create the auth account directly (no email sent, pre-confirmed)
      let userId: string | null = null;
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
      });

      if (createError) {
        // User already exists — find their UUID via auth list
        const isAlreadyExists =
          createError.message?.toLowerCase().includes('already') ||
          createError.message?.toLowerCase().includes('registered');
        if (!isAlreadyExists) throw createError;

        const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
        const found = listData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
        userId = found?.id ?? null;
      } else {
        userId = created.user?.id ?? null;
      }

      if (!userId) throw new Error(`Could not resolve auth user ID for ${email}`);

      // 2. Ensure public.users row is correct (delete any stale rows by email, upsert by id)
      await admin.from('users').delete().eq('email', email.toLowerCase()).neq('id', userId);
      await admin.from('users').upsert(
        { id: userId, email, role: 'Content Creator', account_status: 'awaiting_confirmation' },
        { onConflict: 'id', ignoreDuplicates: true },
      );

      // 3. Generate a password-setup link (type: recovery = "set your password" flow)
      const { data: linkData } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo: `${appUrl}/` },
      });
      const resetLink = linkData?.properties?.action_link;

      return { userId, resetLink };
    };

    // ── Start beta ────────────────────────────────────────────────────────────
    if (action === 'start_beta') {
      const { data: betaUsers } = await admin
        .from('beta_users')
        .select('*')
        .eq('beta_id', beta_id)
        .is('invited_at', null);

      const results: { email: string; success: boolean; magic_link?: string; error?: string }[] = [];

      for (const bu of betaUsers ?? []) {
        try {
          const { userId, resetLink } = await provisionUser(bu.email);
          await admin.from('beta_users').update({
            invited_at: new Date().toISOString(),
            user_id: userId,
          }).eq('id', bu.id);
          results.push({ email: bu.email, success: true, magic_link: resetLink });
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

    // ── Resend / get reset link ───────────────────────────────────────────────
    if (action === 'resend_invite') {
      const { email } = body;
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

      const { userId, resetLink } = await provisionUser(email);

      await admin.from('beta_users').update({
        invited_at: new Date().toISOString(),
        user_id: userId,
      }).eq('beta_id', beta_id).eq('email', email);

      return NextResponse.json({ success: true, magic_link: resetLink });
    }

    // ── Debug user state ─────────────────────────────────────────────────────
    if (action === 'debug_user') {
      const { email: debugEmail } = body;
      if (!debugEmail) return NextResponse.json({ error: 'email required' }, { status: 400 });

      // 1. Check public.users
      const { data: pubRow } = await admin
        .from('users')
        .select('id, email, role, account_status')
        .eq('email', debugEmail.toLowerCase())
        .maybeSingle();

      // 2. Check auth.users via the UUID in public.users
      let authByPubId: any = null;
      if (pubRow) {
        const { data: a } = await admin.auth.admin.getUserById(pubRow.id);
        authByPubId = a?.user ? { id: a.user.id, email: a.user.email, confirmed: a.user.email_confirmed_at } : null;
      }

      // 3. Try generateLink directly
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://forge.gdcgroup.com';
      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email: debugEmail,
        options: { redirectTo: `${appUrl}/` },
      });

      return NextResponse.json({
        public_users_row: pubRow ?? null,
        auth_user_by_pub_id: authByPubId,
        generate_link_result: linkData?.properties?.action_link
          ? { success: true, link: linkData.properties.action_link }
          : { success: false, error: linkError?.message ?? 'no link returned' },
      });
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
