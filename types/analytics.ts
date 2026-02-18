// Content Analytics type definitions

import { User } from './index';

export type AnalyticsEventType =
  | 'project_created'
  | 'project_exported'
  | 'brief_created'
  | 'brief_edited'
  | 'brief_shared';

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: AnalyticsEventType;
  entity_id?: string;
  entity_type?: 'project' | 'brief';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AnalyticsSummary {
  projects_created: number;
  projects_exported: number;
  total_words: number;
  avg_word_count: number;
  briefs_created: number;
  briefs_edited: number;
  briefs_shared: number;
  avg_seo_score: number;
  daily_breakdown: DailyBreakdown[];
}

export interface DailyBreakdown {
  date: string;
  projects_created: number;
  words_written: number;
  exports: number;
  briefs_created: number;
}

export interface TeamMemberStats {
  user: Pick<User, 'id' | 'full_name' | 'email' | 'role'>;
  stats: AnalyticsSummary;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  managed_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  user?: User;
  added_at: string;
}

export interface SavedFilter {
  id: string;
  user_id: string;
  name: string;
  filter_config: FilterConfig;
  is_shared: boolean;
  share_token?: string;
  created_at: string;
  updated_at: string;
}

export interface FilterConfig {
  dateFrom?: string;
  dateTo?: string;
  preset?: string;
  teamId?: string;
  userId?: string;
}

export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'html';
