import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSuperAdmin } from '@/lib/super-admin';

// GET /api/writer-models — list all (admin) or own + house models (user)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const isAdmin = isSuperAdmin(user.email);

    if (isAdmin) {
      // Super admins see all models with user assignments
      const { data: models, error } = await admin
        .from('writer_models')
        .select('*')
        .order('is_house_model', { ascending: false })
        .order('name');

      if (error) throw error;

      // Fetch user assignments (users whose default_writer_model_id matches)
      const { data: userAssignments } = await admin
        .from('users')
        .select('id, email, full_name, default_writer_model_id')
        .not('default_writer_model_id', 'is', null);

      const assignmentsByModel: Record<string, typeof userAssignments> = {};
      for (const u of userAssignments ?? []) {
        if (!u.default_writer_model_id) continue;
        if (!assignmentsByModel[u.default_writer_model_id]) {
          assignmentsByModel[u.default_writer_model_id] = [];
        }
        assignmentsByModel[u.default_writer_model_id]!.push(u);
      }

      return NextResponse.json({
        data: models?.map(m => ({
          ...m,
          assigned_users: assignmentsByModel[m.id] ?? [],
        })),
      });
    } else {
      // Regular users see own + house models
      const { data, error } = await admin
        .from('writer_models')
        .select('*')
        .or(`strategist_id.eq.${user.id},is_house_model.eq.true`)
        .order('name');

      if (error) throw error;
      return NextResponse.json({ data });
    }
  } catch (err: any) {
    console.error('[writer-models GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/writer-models — create a new writer model (admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isSuperAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, is_house_model, strategist_id } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('writer_models')
      .insert({
        name: name.trim(),
        is_house_model: !!is_house_model,
        strategist_id: is_house_model ? null : (strategist_id || null),
        created_by: user.id,
        metadata: { description: description?.trim() || '', total_training_pieces: 0 },
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[writer-models POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/writer-models — update name/description or assign to user
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isSuperAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, description, is_house_model, assign_user_id, unassign_user_id } = body;

    const admin = createAdminClient();

    // Handle user assignment
    if (assign_user_id) {
      const { error } = await admin
        .from('users')
        .update({ default_writer_model_id: id })
        .eq('id', assign_user_id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Handle user unassignment
    if (unassign_user_id) {
      const { error } = await admin
        .from('users')
        .update({ default_writer_model_id: null })
        .eq('id', unassign_user_id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Update model fields
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name.trim();
    if (is_house_model !== undefined) updates.is_house_model = is_house_model;
    if (description !== undefined) {
      // Need to merge metadata
      const { data: existing } = await admin.from('writer_models').select('metadata').eq('id', id).single();
      updates.metadata = { ...(existing?.metadata ?? {}), description: description.trim() };
    }

    const { data, error } = await admin
      .from('writer_models')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[writer-models PATCH]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/writer-models?id=xxx — delete a model (admin only)
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

    // Clear any user assignments first
    await admin
      .from('users')
      .update({ default_writer_model_id: null })
      .eq('default_writer_model_id', id);

    const { error } = await admin.from('writer_models').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[writer-models DELETE]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
