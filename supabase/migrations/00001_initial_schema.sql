-- Enable pgvector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'strategist');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'strategist',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Writer models table
CREATE TABLE public.writer_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  strategist_id UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Training content table with vector embeddings
CREATE TABLE public.training_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID REFERENCES public.writer_models(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimensions
  analyzed_style JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('brief', 'project')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(name, type)
);

-- Briefs table
CREATE TABLE public.briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_shared BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  seo_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Projects table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  headline TEXT NOT NULL,
  primary_keyword TEXT NOT NULL,
  secondary_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  topic TEXT,
  word_count_target INTEGER NOT NULL DEFAULT 800,
  writer_model_id UUID REFERENCES public.writer_models(id) NOT NULL,
  brief_id UUID REFERENCES public.briefs(id) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo_score NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- API keys table (encrypted)
CREATE TABLE public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  key_encrypted TEXT NOT NULL,
  updated_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AI tuner settings table
CREATE TABLE public.ai_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_training_content_model_id ON public.training_content(model_id);
CREATE INDEX idx_training_content_embedding ON public.training_content USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_briefs_created_by ON public.briefs(created_by);
CREATE INDEX idx_writer_models_strategist_id ON public.writer_models(strategist_id);

-- Create vector similarity search function
CREATE OR REPLACE FUNCTION match_training_content(
  query_embedding vector(1536),
  match_model_id UUID,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  model_id UUID,
  content TEXT,
  analyzed_style JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    training_content.id,
    training_content.model_id,
    training_content.content,
    training_content.analyzed_style,
    1 - (training_content.embedding <=> query_embedding) AS similarity
  FROM public.training_content
  WHERE training_content.model_id = match_model_id
  AND training_content.embedding IS NOT NULL
  ORDER BY training_content.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_writer_models_updated_at BEFORE UPDATE ON public.writer_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_briefs_updated_at BEFORE UPDATE ON public.briefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_settings_updated_at BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


