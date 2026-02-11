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
