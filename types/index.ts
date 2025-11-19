// Core type definitions for RotoWrite

export type UserRole = 'admin' | 'strategist' | 'editor';
export type AccountStatus = 'pending' | 'strategist' | 'editor' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  account_status: AccountStatus;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
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


