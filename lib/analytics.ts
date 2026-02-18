import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyticsEventType } from '@/types/analytics';

/**
 * Track a user content action in the analytics_events table.
 * Silently catches errors — analytics tracking should never break the main flow.
 */
export async function trackEvent(
  supabase: SupabaseClient,
  userId: string,
  eventType: AnalyticsEventType,
  entityId?: string,
  entityType?: 'project' | 'brief',
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: eventType,
      entity_id: entityId || null,
      entity_type: entityType || null,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('Failed to track analytics event:', error);
  }
}
