import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * One-time backfill of analytics_events from existing projects and briefs.
 * Super admin only.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden — super_admin only' }, { status: 403 });
    }

    let created = 0;

    // Backfill project_created events
    const { data: projects } = await supabase.from('projects').select('id, user_id, created_at');
    if (projects) {
      const events = projects.map((p) => ({
        user_id: p.user_id,
        event_type: 'project_created',
        entity_id: p.id,
        entity_type: 'project',
        metadata: {},
        created_at: p.created_at,
      }));
      if (events.length > 0) {
        const { error } = await supabase.from('analytics_events').insert(events);
        if (!error) created += events.length;
      }
    }

    // Backfill brief_created events
    const { data: briefs } = await supabase.from('briefs').select('id, created_by, is_shared, created_at');
    if (briefs) {
      const briefEvents = briefs.map((b) => ({
        user_id: b.created_by,
        event_type: 'brief_created',
        entity_id: b.id,
        entity_type: 'brief',
        metadata: {},
        created_at: b.created_at,
      }));
      if (briefEvents.length > 0) {
        const { error } = await supabase.from('analytics_events').insert(briefEvents);
        if (!error) created += briefEvents.length;
      }

      // Backfill brief_shared events for shared briefs
      const sharedBriefs = briefs.filter((b) => b.is_shared);
      const sharedEvents = sharedBriefs.map((b) => ({
        user_id: b.created_by,
        event_type: 'brief_shared',
        entity_id: b.id,
        entity_type: 'brief',
        metadata: {},
        created_at: b.created_at,
      }));
      if (sharedEvents.length > 0) {
        const { error } = await supabase.from('analytics_events').insert(sharedEvents);
        if (!error) created += sharedEvents.length;
      }
    }

    return NextResponse.json({ success: true, events_created: created });
  } catch (error) {
    console.error('Backfill error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
