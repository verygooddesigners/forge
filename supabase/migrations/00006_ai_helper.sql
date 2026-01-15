-- Migration: 00006_ai_helper.sql
-- Description: Create ai_helper_entries table for Q/A library

CREATE TABLE public.ai_helper_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  updated_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for search and filtering
CREATE INDEX idx_ai_helper_entries_is_active ON public.ai_helper_entries(is_active);
CREATE INDEX idx_ai_helper_entries_tags ON public.ai_helper_entries USING GIN(tags);
CREATE INDEX idx_ai_helper_entries_question_search ON public.ai_helper_entries USING gin(to_tsvector('english', question));

-- Add updated_at trigger
CREATE TRIGGER update_ai_helper_entries_updated_at
  BEFORE UPDATE ON public.ai_helper_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.ai_helper_entries ENABLE ROW LEVEL SECURITY;

-- Policies: All authenticated users can read active entries
CREATE POLICY "All authenticated users can read active entries"
  ON public.ai_helper_entries FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- Policies: Admins can manage all entries
CREATE POLICY "Admins can manage all entries"
  ON public.ai_helper_entries FOR ALL
  USING (is_admin(auth.uid()));
