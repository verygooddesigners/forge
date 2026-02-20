// Core type definitions for Forge

export type AccountStatus = 'awaiting_confirmation' | 'confirmed';

// All 28 permission keys in the system
export type PermissionKey =
  // Content
  | 'can_create_projects'
  | 'can_edit_own_projects'
  | 'can_delete_own_projects'
  | 'can_share_projects'
  | 'can_use_smartbriefs'
  | 'can_edit_any_brief'
  | 'can_delete_any_brief'
  | 'can_export_content'
  | 'can_manage_own_writer_model'
  // AI & Tools
  | 'can_use_ai_agents'
  | 'can_tune_ai_agents'
  | 'can_toggle_ai_agents'
  | 'can_edit_master_ai'
  | 'can_manage_trusted_sources'
  // Analytics
  | 'can_view_analytics'
  | 'can_view_team_analytics'
  // User Management
  | 'can_view_users'
  | 'can_create_users'
  | 'can_edit_users'
  | 'can_delete_users'
  | 'can_manage_teams'
  | 'can_create_teams'
  // Admin Access
  | 'can_access_admin'
  | 'can_view_user_guide'
  | 'can_manage_api_keys'
  | 'can_manage_sso'
  | 'can_manage_tools'
  | 'can_manage_role_permissions';

// Dynamic role — name is the display name (e.g. "Super Administrator")
export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Display labels for account status
export const STATUS_LABELS: Record<AccountStatus, string> = {
  awaiting_confirmation: 'Awaiting Confirmation',
  confirmed: 'Confirmed',
};

export interface User {
  id: string;
  email: string;
  role: string; // Display name, e.g. "Super Administrator", "Content Creator"
  account_status: AccountStatus;
  is_tool_creator?: boolean;
  full_name?: string;
  job_title?: string;
  avatar_url?: string;
  auth_provider?: 'email' | 'azure' | 'google' | 'github';
  created_at: string;
  updated_at: string;
}

export interface MicrosoftUserInfo {
  isMicrosoftUser: boolean;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  provider?: string;
}

export interface WriterModel {
  id: string;
  name: string;
  strategist_id?: string;
  created_by: string;
  metadata?: {
    description?: string;
    total_training_pieces?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface TrainingContent {
  id: string;
  model_id: string;
  content: string;
  embedding?: number[];
  analyzed_style?: {
    tone?: string;
    voice?: string;
    vocabulary_level?: string;
    sentence_structure?: string;
    key_phrases?: string[];
  };
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'brief' | 'project';
  created_at: string;
}

export interface Brief {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  category?: Category;
  content: any; // TipTap JSON
  is_shared: boolean;
  created_by: string;
  seo_config?: {
    keyword_density?: number;
    heading_structure?: string[];
    required_sections?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  headline: string;
  file_name?: string;
  is_shared?: boolean;
  primary_keyword: string;
  secondary_keywords: string[];
  topic?: string;
  word_count_target: number;
  writer_model_id: string;
  writer_model?: WriterModel;
  brief_id: string;
  brief?: Brief;
  content: any; // TipTap JSON
  seo_score?: number;
  research_brief?: ResearchBrief;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  service_name: string;
  key_encrypted: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  published_date: string;
  image_url?: string;
  relevance_score: number;
}

export interface ResearchArticle extends NewsArticle {
  id: string;
  trust_score: number;
  is_trusted: boolean;
  is_flagged: boolean;
  feedback_reason?: string;
  full_content?: string;
}

export interface VerifiedFact {
  fact: string;
  confidence: 'high' | 'medium' | 'low';
  sources: string[];
  verification_date: string;
}

export interface DisputedFact {
  fact: string;
  conflicting_sources: string[];
  explanation: string;
}

export interface ArticleFeedback {
  article_id: string;
  reason: FeedbackReason;
  notes?: string;
}

export type FeedbackReason = 
  | 'inaccurate_information'
  | 'outdated_information'
  | 'unreliable_source'
  | 'off_topic'
  | 'duplicate_content'
  | 'misleading_headline'
  | 'other';

export interface ResearchBrief {
  articles: ResearchArticle[];
  verified_facts: VerifiedFact[];
  disputed_facts: DisputedFact[];
  user_feedback: ArticleFeedback[];
  fact_check_complete: boolean;
  fact_check_timestamp?: string;
  research_timestamp: string;
  confidence_score: number;
}

export interface TrustedSource {
  id: string;
  domain: string;
  name: string;
  trust_level: 'high' | 'medium' | 'low' | 'untrusted';
  category: string[];
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SEOAnalysis {
  score: number;
  keyword_density: number;
  heading_structure: {
    h1_count: number;
    h2_count: number;
    h3_count: number;
  };
  suggestions: string[];
  brief_compliance?: {
    required_sections_present: boolean;
    missing_sections?: string[];
  };
}

export interface AIHelperEntry {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  is_active: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export type CursorRemoteCommandStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'canceled';

export interface CursorRemoteCommand {
  id: string;
  command_text: string;
  status: CursorRemoteCommandStatus | string;
  created_by?: string | null;
  target_agent_id?: string | null;
  claimed_by?: string | null;
  claimed_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  result_text?: string | null;
  error_text?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CursorAgentStatus {
  id: string;
  agent_id: string;
  status: string;
  current_task?: string | null;
  last_message?: string | null;
  last_heartbeat?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  managed_by?: string;
  manager?: User;
  member_count?: number;
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


