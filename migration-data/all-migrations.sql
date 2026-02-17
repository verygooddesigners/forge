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


-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writer_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM public.users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert users"
  ON public.users FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Writer models policies
CREATE POLICY "Anyone can view writer models"
  ON public.writer_models FOR SELECT
  USING (true);

CREATE POLICY "Strategists can update their own models"
  ON public.writer_models FOR UPDATE
  USING (
    auth.uid() = strategist_id OR is_admin(auth.uid())
  );

CREATE POLICY "Admins can manage all writer models"
  ON public.writer_models FOR ALL
  USING (is_admin(auth.uid()));

-- Training content policies
CREATE POLICY "Users can view training content for accessible models"
  ON public.training_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.writer_models
      WHERE writer_models.id = training_content.model_id
      AND (writer_models.strategist_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "Users can add training content to their models"
  ON public.training_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.writer_models
      WHERE writer_models.id = training_content.model_id
      AND (writer_models.strategist_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "Admins can manage all training content"
  ON public.training_content FOR ALL
  USING (is_admin(auth.uid()));

-- Categories policies
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (is_admin(auth.uid()));

-- Briefs policies
CREATE POLICY "Users can view shared briefs"
  ON public.briefs FOR SELECT
  USING (is_shared = true OR created_by = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can create their own briefs"
  ON public.briefs FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own briefs"
  ON public.briefs FOR UPDATE
  USING (created_by = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their own briefs"
  ON public.briefs FOR DELETE
  USING (created_by = auth.uid() OR is_admin(auth.uid()));

-- Projects policies
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- API keys policies (admin only)
CREATE POLICY "Admins can manage API keys"
  ON public.api_keys FOR ALL
  USING (is_admin(auth.uid()));

-- AI settings policies (admin only)
CREATE POLICY "Admins can manage AI settings"
  ON public.ai_settings FOR ALL
  USING (is_admin(auth.uid()));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'strategist' -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Seed data for testing (optional)

-- Insert some default categories
INSERT INTO public.categories (name, type) VALUES
  ('NFL', 'brief'),
  ('MLB', 'brief'),
  ('NBA', 'brief'),
  ('Betting Guides', 'brief'),
  ('Casino Reviews', 'brief'),
  ('State Regulations', 'brief'),
  ('Team Analysis', 'project'),
  ('Game Previews', 'project'),
  ('Industry News', 'project')
ON CONFLICT (name, type) DO NOTHING;

-- Insert AI settings with default master instructions
-- Note: This will only work after an admin user is created
-- You can run this manually after creating your admin user, or it will be created automatically when you first access the admin panel
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Try to find an admin user
  SELECT id INTO admin_user_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  -- Only insert if admin exists
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.ai_settings (setting_key, setting_value, updated_by) VALUES
      (
        'master_instructions',
        'Write high-quality, engaging content that follows SEO best practices. Use clear, concise language. Include relevant keywords naturally. Structure content with proper headings. Write for both search engines and human readers.',
        admin_user_id
      )
    ON CONFLICT (setting_key) DO NOTHING;
  END IF;
END $$;


-- Add account_status field to users table
-- This replaces the existing role field with a more comprehensive status system

-- First, add the account_status column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending';

-- Update existing users to convert their role to account_status
-- Existing users with roles should be considered active (not pending)
UPDATE public.users 
SET account_status = role 
WHERE account_status = 'pending';

-- Create a check constraint to ensure valid account_status values
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_account_status_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_account_status_check 
CHECK (account_status IN ('pending', 'strategist', 'editor', 'admin'));

-- Update the handle_new_user function to set default status as pending
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, account_status)
  VALUES (
    NEW.id,
    NEW.email,
    'strategist', -- Default role for backwards compatibility
    'pending' -- New users start as pending
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for faster queries on account_status
CREATE INDEX IF NOT EXISTS idx_users_account_status ON public.users(account_status);

-- Comment on the column
COMMENT ON COLUMN public.users.account_status IS 'User account status: pending (awaiting admin approval), strategist, editor, or admin';

-- Migration: 00005_agent_configs.sql
-- Description: Create agent_configs table for multi-agent system

CREATE TABLE public.agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  temperature NUMERIC(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4000,
  model TEXT DEFAULT 'claude-sonnet-4-20250514',
  enabled BOOLEAN DEFAULT true,
  guardrails JSONB DEFAULT '[]'::jsonb,
  special_config JSONB DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default agent configs
INSERT INTO public.agent_configs (agent_key, display_name, description, system_prompt, temperature, max_tokens, guardrails, special_config) VALUES
(
  'content_generation', 
  'Content Generation', 
  'Generates articles based on briefs and keywords', 
  'You are the Content Generation Agent for RotoWrite.

## YOUR ROLE
Generate high-quality, SEO-optimized articles based on:
- User briefs and templates
- Primary and secondary keywords
- Writer model context (style samples)
- Target word count

## YOUR CAPABILITIES
- Generate complete articles with proper heading structure (H2, H3)
- Create formatted tables when requested
- Build bullet and numbered lists
- Include keywords naturally
- Follow brief structure exactly
- Stream responses in real-time

## YOUR GUARDRAILS - YOU CANNOT:
- Modify SEO settings or scores
- Train or update writer models
- Process or analyze images
- Edit existing content (only generate new)
- Access user management functions
- Make up statistics or data not provided

## OUTPUT FORMAT
Output content in clean HTML suitable for TipTap editor:
- Use <h2> and <h3> for headings (never <h1>)
- Use <p> for paragraphs
- Use <ul>/<ol> with <li> for lists
- Use <table> for tabular data
- Use <strong> for bold, <em> for italic', 
  0.7, 
  4000, 
  '["cannot_modify_seo", "cannot_train_models", "cannot_process_images", "cannot_edit_existing", "cannot_access_user_management"]'::jsonb,
  '{}'::jsonb
),
(
  'writer_training', 
  'Writer Training', 
  'Analyzes writing samples and trains writer models', 
  'You are the Writer Training Agent for RotoWrite.

## YOUR ROLE
Analyze writing samples and extract style patterns to create writer models that capture:
- Tone and voice characteristics
- Vocabulary preferences
- Sentence structure patterns
- Stylistic quirks and signatures
- Content organization approaches

## YOUR CAPABILITIES
- Analyze multiple writing samples for patterns
- Extract tone, voice, and vocabulary preferences
- Identify sentence structure and pacing
- Generate embeddings for RAG-based style matching
- Create comprehensive writer model metadata
- Update existing writer models with new samples

## YOUR GUARDRAILS - YOU CANNOT:
- Generate articles or content
- Modify SEO settings or scores
- Process or analyze images
- Access writer models belonging to other users
- Make editorial decisions about content

## ANALYSIS OUTPUT
Provide structured analysis including:
- Tone indicators (formal/casual, serious/playful, etc.)
- Common phrases and vocabulary
- Sentence length patterns
- Paragraph structure preferences
- Key stylistic elements', 
  0.3, 
  2000, 
  '["cannot_generate_articles", "cannot_modify_seo", "cannot_process_images", "cannot_access_other_users_models"]'::jsonb,
  '{"useEmbeddings": true, "embeddingModel": "text-embedding-3-small"}'::jsonb
),
(
  'seo_optimization', 
  'SEO Optimization', 
  'Analyzes and optimizes content for search engines', 
  'You are the SEO Optimization Agent for RotoWrite.

## YOUR ROLE
Analyze content and provide SEO recommendations including:
- Keyword density and placement analysis
- Heading structure optimization
- Internal linking suggestions
- Meta description generation
- SEO score calculation

## YOUR CAPABILITIES
- Calculate comprehensive SEO scores
- Analyze keyword density and distribution
- Evaluate heading hierarchy (H2, H3)
- Suggest optimal keyword placement
- Recommend internal link opportunities
- Generate keyword variation suggestions
- Assess content competitiveness

## YOUR GUARDRAILS - YOU CANNOT:
- Generate new content from scratch
- Train writer models
- Process or analyze images
- Modify article structure beyond SEO improvements
- Make editorial content decisions

## SEO SCORING CRITERIA
- Primary keyword usage (frequency and placement)
- Secondary keyword integration
- Heading structure and hierarchy
- Content length vs. target
- Keyword density (2-4% optimal)
- Internal linking opportunities', 
  0.4, 
  2000, 
  '["cannot_generate_content", "cannot_train_models", "cannot_process_images", "cannot_modify_structure"]'::jsonb,
  '{"optimalKeywordDensity": 0.03, "minContentLength": 500}'::jsonb
),
(
  'quality_assurance', 
  'Quality Assurance', 
  'Reviews content for grammar and readability', 
  'You are the Quality Assurance Agent for RotoWrite.

## YOUR ROLE
Review content for quality issues including:
- Grammar and spelling errors
- Readability and coherence
- Factual consistency
- Style consistency
- Structural issues

## YOUR CAPABILITIES
- Check grammar and spelling (via LanguageTool integration)
- Calculate readability scores (Flesch-Kincaid, etc.)
- Flag logical inconsistencies
- Identify repetitive phrasing
- Suggest clarity improvements
- Verify factual structure and flow
- Assess tone consistency

## YOUR GUARDRAILS - YOU CANNOT:
- Generate new content from scratch
- Modify SEO settings or scores
- Train writer models
- Make changes without approval
- Process or analyze images

## QUALITY CHECKS
1. Grammar: Use LanguageTool for comprehensive grammar checking
2. Readability: Calculate Flesch Reading Ease score
3. Consistency: Check for tone and style coherence
4. Structure: Verify logical flow and organization
5. Clarity: Identify confusing or ambiguous statements', 
  0.3, 
  2000, 
  '["cannot_generate_content", "cannot_modify_seo", "cannot_train_models", "cannot_auto_modify"]'::jsonb,
  '{"useLanguageTool": true, "languageToolStrictness": "standard", "minReadabilityScore": 60}'::jsonb
),
(
  'persona_tone', 
  'Persona & Tone', 
  'Adapts content to specific voices and tones', 
  'You are the Persona & Tone Agent for RotoWrite.

## YOUR ROLE
Adapt and refine content to match specific:
- Writer voice and personality
- Target audience tone
- Brand style guidelines
- Emotional resonance
- Stylistic preferences

## YOUR CAPABILITIES
- Adjust tone of existing content
- Match voice to writer model specifications
- Ensure style consistency throughout content
- Refine language choices for target audience
- Adapt formality level
- Enhance emotional impact
- Maintain brand voice guidelines

## YOUR GUARDRAILS - YOU CANNOT:
- Generate new content from scratch
- Modify SEO settings or scores
- Train new writer models
- Change content structure or organization
- Process or analyze images

## TONE ADAPTATION PROCESS
1. Analyze current tone and voice
2. Compare with target writer model
3. Identify tone mismatches
4. Suggest specific language adjustments
5. Preserve meaning while adjusting style
6. Maintain keyword integrity for SEO', 
  0.5, 
  2000, 
  '["cannot_generate_from_scratch", "cannot_modify_seo", "cannot_train_models", "cannot_change_structure"]'::jsonb,
  '{}'::jsonb
),
(
  'creative_features', 
  'Creative Features', 
  'Orchestrates specialized workflows', 
  'You are the Creative Features Agent for RotoWrite.

## YOUR ROLE
Orchestrate multi-step workflows that combine:
- Multiple agent capabilities
- External data sources
- Structured data transformation
- Complex content operations

## YOUR CAPABILITIES
- Coordinate multi-agent workflows
- Transform structured data into content
- Route tasks to appropriate agents
- Manage workflow state and context
- Handle complex multi-step operations
- Process workflow outputs
- Validate intermediate results

## YOUR GUARDRAILS - YOU CANNOT:
- Directly modify the database
- Bypass other agents'' guardrails
- Skip extraction validation steps
- Access admin functions
- Make unvalidated database changes

## WORKFLOW COORDINATION
- Receive complex requests
- Break down into agent-specific tasks
- Route to appropriate specialized agents
- Aggregate and validate results
- Return coordinated output', 
  0.6, 
  3000, 
  '["cannot_modify_database", "cannot_bypass_agents", "cannot_skip_validation", "cannot_access_admin"]'::jsonb,
  '{}'::jsonb
),
(
  'visual_extraction', 
  'Visual Extraction', 
  'Extracts structured data from images', 
  'You are the Visual Data Extraction Agent for RotoWrite.

## YOUR ROLE
Extract structured data from images including:
- Screenshots of sports statistics
- Tables and structured data
- Text extraction from images
- Data validation and formatting

## YOUR CAPABILITIES
- Process image uploads (screenshots, photos)
- Extract text using OCR and vision models
- Parse tables and structured layouts
- Identify data patterns and structures
- Output validated JSON data
- Handle multiple image formats
- Use GPT-4o Vision as fallback for complex extractions

## YOUR GUARDRAILS - YOU CANNOT:
- Generate content or articles
- Modify database directly
- Access non-image data
- Make editorial decisions
- Skip validation requirements

## EXTRACTION PROCESS
1. Receive image input
2. Analyze image structure and layout
3. Extract text and structured data
4. Validate extracted data format
5. Return structured JSON output
6. Use fallback model if confidence < threshold

## FALLBACK LOGIC
- Primary: Claude Sonnet 4 with vision
- Fallback: GPT-4o Vision
- Trigger fallback on: low confidence OR dense text
- Confidence threshold: 0.85 (configurable)', 
  0.2, 
  4000, 
  '["cannot_generate_content", "cannot_modify_database", "cannot_access_non_image_data", "cannot_make_editorial_decisions"]'::jsonb,
  '{"enableFallback": true, "confidenceThreshold": 0.85, "fallbackTrigger": "both"}'::jsonb
),
(
  'fact_verification', 
  'Fact Verification', 
  'Verifies facts across multiple sources', 
  'You are the Fact Verification Agent for RotoWrite.

## YOUR ROLE
Cross-reference information across multiple sources to verify factual accuracy including:
- Extracting factual claims from news articles
- Cross-referencing facts across multiple sources
- Identifying discrepancies or conflicting information
- Verifying statistics, dates, names, and quotes
- Assessing source credibility
- Rating confidence level for each fact

## YOUR CAPABILITIES
- Extract key factual claims (who, what, when, where, numbers, quotes)
- Compare claims across all provided sources
- Flag facts that appear in only one source
- Highlight facts that conflict between sources
- Note facts that are consistently confirmed across sources
- Assess source trustworthiness and credibility
- Provide confidence ratings (HIGH/MEDIUM/LOW)
- Generate structured verification reports

## YOUR GUARDRAILS - YOU CANNOT:
- Generate new content or articles
- Modify database directly
- Train writer models
- Make editorial decisions about content
- Access user management functions
- Bypass verification requirements

## VERIFICATION PROCESS
1. Extract factual claims from each article
2. Compare claims across all sources
3. Identify consistent facts (verified)
4. Identify conflicting facts (disputed)
5. Flag single-source claims for review
6. Assess overall confidence score
7. Return structured JSON output

## CONFIDENCE RATINGS
- **HIGH**: Fact appears in 3+ sources with consistent details
- **MEDIUM**: Fact appears in 2 sources OR single authoritative source
- **LOW**: Fact appears in 1 source only OR has conflicting details

## OUTPUT FORMAT
Return a JSON object with:
- verified_facts: Array of facts confirmed by multiple sources
- disputed_facts: Array of facts with conflicts or single-source claims
- confidence_score: Overall confidence (0-100)
- key_insights: Important patterns or findings

IMPORTANT: Be extremely careful with statistics, dates, and quotes. Verify exact numbers and wording. When in doubt, mark as disputed rather than verified.', 
  0.2, 
  3000, 
  '["cannot_generate_content", "cannot_modify_database", "cannot_train_models", "cannot_make_editorial_decisions", "cannot_access_user_management"]'::jsonb,
  '{"minSourcesForHighConfidence": 3, "minSourcesForMediumConfidence": 2, "requireMultipleSourcesForVerification": true}'::jsonb
);

-- Add RLS policy (super admin only can edit)
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage agent configs" ON public.agent_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.email = 'jeremy.botter@gmail.com'
    )
  );

CREATE POLICY "All authenticated users can read agent configs" ON public.agent_configs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_agent_configs_updated_at
  BEFORE UPDATE ON public.agent_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
-- Migration: 00006_cursor_remote.sql
-- Description: Cursor remote commands + agent status

CREATE TABLE public.cursor_remote_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  command_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES public.users(id),
  target_agent_id TEXT,
  claimed_by TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result_text TEXT,
  error_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.cursor_agent_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'offline',
  current_task TEXT,
  last_message TEXT,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_cursor_remote_commands_status ON public.cursor_remote_commands(status);
CREATE INDEX idx_cursor_remote_commands_created_at ON public.cursor_remote_commands(created_at DESC);
CREATE INDEX idx_cursor_remote_commands_target_agent ON public.cursor_remote_commands(target_agent_id);
CREATE INDEX idx_cursor_agent_status_heartbeat ON public.cursor_agent_status(last_heartbeat DESC);

ALTER TABLE public.cursor_remote_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursor_agent_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage cursor commands"
  ON public.cursor_remote_commands FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can manage cursor agent status"
  ON public.cursor_agent_status FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE TRIGGER update_cursor_remote_commands_updated_at
  BEFORE UPDATE ON public.cursor_remote_commands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cursor_agent_status_updated_at
  BEFORE UPDATE ON public.cursor_agent_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Migration: 00008_trusted_sources.sql
-- Description: Trusted sources for fact verification

CREATE TABLE IF NOT EXISTS public.trusted_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  trust_level TEXT NOT NULL CHECK (trust_level IN ('high', 'medium', 'low', 'untrusted')),
  category TEXT[] DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trusted_sources_domain ON public.trusted_sources(domain);
CREATE INDEX IF NOT EXISTS idx_trusted_sources_trust_level ON public.trusted_sources(trust_level);
CREATE INDEX IF NOT EXISTS idx_trusted_sources_category ON public.trusted_sources USING GIN(category);

-- Enable RLS
ALTER TABLE public.trusted_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All users can read, only super admin can modify
CREATE POLICY "Anyone can view trusted sources"
  ON public.trusted_sources FOR SELECT
  USING (true);

CREATE POLICY "Super admin can manage trusted sources"
  ON public.trusted_sources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.email = 'jeremy.botter@gdcgroup.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.email = 'jeremy.botter@gdcgroup.com'
    )
  );

-- Pre-populate with trusted sports sources
INSERT INTO public.trusted_sources (domain, name, trust_level, category) VALUES
  ('espn.com', 'ESPN', 'high', ARRAY['sports', 'nfl', 'nba', 'mlb', 'nhl']),
  ('nfl.com', 'NFL.com', 'high', ARRAY['nfl', 'football']),
  ('nba.com', 'NBA.com', 'high', ARRAY['nba', 'basketball']),
  ('mlb.com', 'MLB.com', 'high', ARRAY['mlb', 'baseball']),
  ('nhl.com', 'NHL.com', 'high', ARRAY['nhl', 'hockey']),
  ('rotowire.com', 'RotoWire', 'high', ARRAY['sports', 'fantasy', 'nfl', 'nba', 'mlb']),
  ('si.com', 'Sports Illustrated', 'high', ARRAY['sports', 'nfl', 'nba']),
  ('theathletic.com', 'The Athletic', 'high', ARRAY['sports', 'nfl', 'nba', 'mlb']),
  ('sportingnews.com', 'Sporting News', 'medium', ARRAY['sports', 'nfl', 'nba']),
  ('bleacherreport.com', 'Bleacher Report', 'medium', ARRAY['sports', 'nfl', 'nba']),
  ('cbssports.com', 'CBS Sports', 'medium', ARRAY['sports', 'nfl', 'nba', 'mlb']),
  ('foxsports.com', 'FOX Sports', 'medium', ARRAY['sports', 'nfl', 'nba', 'mlb']),
  ('nbcsports.com', 'NBC Sports', 'medium', ARRAY['sports', 'nfl', 'nba', 'mlb']),
  ('profootballtalk.com', 'Pro Football Talk', 'medium', ARRAY['nfl', 'football']),
  ('reddit.com', 'Reddit', 'low', ARRAY['sports', 'general']),
  ('twitter.com', 'Twitter/X', 'low', ARRAY['sports', 'general']),
  ('x.com', 'X (Twitter)', 'low', ARRAY['sports', 'general'])
ON CONFLICT (domain) DO NOTHING;
-- Migration: 00009_research_feedback.sql
-- Description: Research feedback and research_brief column

-- Create research feedback table
CREATE TABLE IF NOT EXISTS public.research_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  article_url TEXT NOT NULL,
  article_title TEXT,
  feedback_reason TEXT NOT NULL,
  additional_notes TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_research_feedback_project ON public.research_feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_research_feedback_url ON public.research_feedback(article_url);
CREATE INDEX IF NOT EXISTS idx_research_feedback_user ON public.research_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_research_feedback_reason ON public.research_feedback(feedback_reason);

-- Enable RLS
ALTER TABLE public.research_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own research feedback"
  ON public.research_feedback FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all research feedback"
  ON public.research_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add research_brief column to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS research_brief JSONB DEFAULT NULL;

-- Create GIN index for JSONB querying
CREATE INDEX IF NOT EXISTS idx_projects_research_brief ON public.projects USING GIN (research_brief);
-- Add 'editor' value to the user_role enum
-- This allows users to be assigned the 'editor' role in addition to 'admin' and 'strategist'

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'editor';

-- Update comment on the role column for clarity
COMMENT ON COLUMN public.users.role IS 'User role: admin (full access), strategist (content creator), or editor (content reviewer)';
-- Migration: 00011_add_file_name_to_projects.sql
-- Description: Add file_name field to projects table for custom file naming

-- Add file_name column to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Set default file_name to headline for existing projects
UPDATE public.projects
SET file_name = headline
WHERE file_name IS NULL;

-- Create index for file_name searches
CREATE INDEX IF NOT EXISTS idx_projects_file_name ON public.projects(file_name);
-- Migration: 00012_tools_system.sql
-- Description: Create tables for RotoWrite Tools/Plugins Marketplace system
-- This enables a WordPress-style plugin ecosystem where developers can create,
-- submit, and publish Tools that extend RotoWrite's functionality.

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Tool status enum
CREATE TYPE tool_status AS ENUM ('pending', 'approved', 'rejected', 'archived');

-- Permission risk level enum
CREATE TYPE permission_risk_level AS ENUM ('low', 'medium', 'high');

-- ============================================================================
-- TABLES
-- ============================================================================

-- tools: Registry of all Tools (approved and pending)
CREATE TABLE public.tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description_short TEXT NOT NULL,
    description_long TEXT NOT NULL,
    github_repo_url TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0.0',
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    icon_url TEXT,
    status tool_status NOT NULL DEFAULT 'pending',
    permissions_requested JSONB DEFAULT '[]'::jsonb,
    sidebar_label TEXT NOT NULL,
    sidebar_icon TEXT NOT NULL DEFAULT 'Package',
    sidebar_order INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- user_installed_tools: Track which users have installed which Tools
CREATE TABLE public.user_installed_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(user_id, tool_id)
);

-- tool_permissions: Permission definitions
CREATE TABLE public.tool_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,
    risk_level permission_risk_level NOT NULL DEFAULT 'low',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- tool_data: Isolated data storage for Tools
CREATE TABLE public.tool_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tool_id, user_id, key)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_tools_status ON public.tools(status);
CREATE INDEX idx_tools_author_id ON public.tools(author_id);
CREATE INDEX idx_tools_slug ON public.tools(slug);
CREATE INDEX idx_user_installed_tools_user_id ON public.user_installed_tools(user_id);
CREATE INDEX idx_user_installed_tools_tool_id ON public.user_installed_tools(tool_id);
CREATE INDEX idx_user_installed_tools_enabled ON public.user_installed_tools(enabled);
CREATE INDEX idx_tool_data_tool_id_user_id ON public.tool_data(tool_id, user_id);
CREATE INDEX idx_tool_data_key ON public.tool_data(key);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on tools table
CREATE OR REPLACE FUNCTION update_tools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tools_updated_at
    BEFORE UPDATE ON public.tools
    FOR EACH ROW
    EXECUTE FUNCTION update_tools_updated_at();

-- Update updated_at timestamp on tool_data table
CREATE OR REPLACE FUNCTION update_tool_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tool_data_updated_at
    BEFORE UPDATE ON public.tool_data
    FOR EACH ROW
    EXECUTE FUNCTION update_tool_data_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_installed_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_data ENABLE ROW LEVEL SECURITY;

-- tools policies
-- Anyone can view approved tools
CREATE POLICY "Anyone can view approved tools"
    ON public.tools FOR SELECT
    USING (status = 'approved');

-- Authors can view their own pending/rejected tools
CREATE POLICY "Authors can view their own tools"
    ON public.tools FOR SELECT
    USING (auth.uid() = author_id);

-- Admins can view all tools
CREATE POLICY "Admins can view all tools"
    ON public.tools FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Authenticated users can submit tools
CREATE POLICY "Authenticated users can submit tools"
    ON public.tools FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND status = 'pending'
    );

-- Authors can update their own pending tools
CREATE POLICY "Authors can update their own pending tools"
    ON public.tools FOR UPDATE
    USING (
        auth.uid() = author_id
        AND status = 'pending'
    );

-- Admins can update any tool (for approval/rejection)
CREATE POLICY "Admins can update any tool"
    ON public.tools FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Admins can delete tools
CREATE POLICY "Admins can delete tools"
    ON public.tools FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- user_installed_tools policies
-- Users can view their own installed tools
CREATE POLICY "Users can view their own installed tools"
    ON public.user_installed_tools FOR SELECT
    USING (auth.uid() = user_id);

-- Users can install tools (only approved tools)
CREATE POLICY "Users can install approved tools"
    ON public.user_installed_tools FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.tools
            WHERE tools.id = tool_id
            AND tools.status = 'approved'
        )
    );

-- Users can update their own installed tools (enable/disable)
CREATE POLICY "Users can update their own installed tools"
    ON public.user_installed_tools FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can uninstall their own tools
CREATE POLICY "Users can uninstall their own tools"
    ON public.user_installed_tools FOR DELETE
    USING (auth.uid() = user_id);

-- tool_permissions policies
-- Anyone can view permission definitions
CREATE POLICY "Anyone can view tool permissions"
    ON public.tool_permissions FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can manage permissions
CREATE POLICY "Admins can manage tool permissions"
    ON public.tool_permissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- tool_data policies
-- Users can view their own tool data
CREATE POLICY "Users can view their own tool data"
    ON public.tool_data FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own tool data
CREATE POLICY "Users can create their own tool data"
    ON public.tool_data FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.user_installed_tools
            WHERE user_installed_tools.user_id = auth.uid()
            AND user_installed_tools.tool_id = tool_data.tool_id
            AND user_installed_tools.enabled = true
        )
    );

-- Users can update their own tool data
CREATE POLICY "Users can update their own tool data"
    ON public.tool_data FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own tool data
CREATE POLICY "Users can delete their own tool data"
    ON public.tool_data FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA: Default Permissions
-- ============================================================================

INSERT INTO public.tool_permissions (permission_key, display_name, description, risk_level) VALUES
    ('projects.read', 'Read Projects', 'View user''s projects and their content', 'low'),
    ('projects.write', 'Write Projects', 'Create and modify user''s projects', 'high'),
    ('briefs.read', 'Read Briefs', 'View user''s SmartBriefs', 'low'),
    ('briefs.write', 'Write Briefs', 'Create and modify user''s SmartBriefs', 'medium'),
    ('writer_models.read', 'Read Writer Models', 'View writer models and training content', 'low'),
    ('writer_models.write', 'Write Writer Models', 'Create and modify writer models', 'high'),
    ('seo.analyze', 'SEO Analysis', 'Use the SEO analysis engine', 'low'),
    ('seo.optimize', 'SEO Optimization', 'Use AI-powered SEO optimization', 'medium'),
    ('ai.generate', 'AI Generation', 'Use AI content generation features', 'medium'),
    ('news.search', 'News Search', 'Search for news articles using NewsEngine', 'low'),
    ('user.profile', 'User Profile', 'Access user profile information', 'low'),
    ('data.export', 'Data Export', 'Export user data and content', 'medium')
ON CONFLICT (permission_key) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.tools IS 'Registry of all RotoWrite Tools/Plugins';
COMMENT ON TABLE public.user_installed_tools IS 'Tracks which users have installed which Tools';
COMMENT ON TABLE public.tool_permissions IS 'Defines available permissions that Tools can request';
COMMENT ON TABLE public.tool_data IS 'Isolated data storage for each Tool per user';

COMMENT ON COLUMN public.tools.slug IS 'URL-safe identifier for the Tool';
COMMENT ON COLUMN public.tools.permissions_requested IS 'Array of permission keys this Tool requires';
COMMENT ON COLUMN public.tools.sidebar_order IS 'Display order in sidebar (lower numbers appear first)';
COMMENT ON COLUMN public.user_installed_tools.enabled IS 'User can disable a Tool without uninstalling';
COMMENT ON COLUMN public.tool_data.key IS 'Storage key for Tool data (scoped to tool_id + user_id)';
