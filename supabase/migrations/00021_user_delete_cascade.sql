-- Allow user deletion by updating all RESTRICT foreign keys referencing users(id).
-- Strategy: SET NULL for content that should be preserved (projects, briefs, models, settings),
--           CASCADE for user-specific data (helper entries, feedback).
-- Each block is wrapped to skip gracefully if the table doesn't exist.

-- ===== projects.user_id → SET NULL (keep projects, unlink user) =====
ALTER TABLE public.projects ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.projects DROP CONSTRAINT projects_user_id_fkey;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- ===== writer_models.strategist_id → SET NULL (already nullable) =====
ALTER TABLE public.writer_models DROP CONSTRAINT writer_models_strategist_id_fkey;
ALTER TABLE public.writer_models
  ADD CONSTRAINT writer_models_strategist_id_fkey FOREIGN KEY (strategist_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- ===== writer_models.created_by → SET NULL =====
ALTER TABLE public.writer_models ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.writer_models DROP CONSTRAINT writer_models_created_by_fkey;
ALTER TABLE public.writer_models
  ADD CONSTRAINT writer_models_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- ===== briefs.created_by → SET NULL =====
ALTER TABLE public.briefs ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.briefs DROP CONSTRAINT briefs_created_by_fkey;
ALTER TABLE public.briefs
  ADD CONSTRAINT briefs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- ===== api_keys.updated_by → SET NULL =====
ALTER TABLE public.api_keys ALTER COLUMN updated_by DROP NOT NULL;
ALTER TABLE public.api_keys DROP CONSTRAINT api_keys_updated_by_fkey;
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- ===== ai_settings.updated_by → SET NULL =====
ALTER TABLE public.ai_settings ALTER COLUMN updated_by DROP NOT NULL;
ALTER TABLE public.ai_settings DROP CONSTRAINT ai_settings_updated_by_fkey;
ALTER TABLE public.ai_settings
  ADD CONSTRAINT ai_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- ===== Tables that may not exist yet — wrapped in exception handlers =====

DO $$ BEGIN
  ALTER TABLE public.agent_configs DROP CONSTRAINT agent_configs_updated_by_fkey;
  ALTER TABLE public.agent_configs
    ADD CONSTRAINT agent_configs_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;
EXCEPTION WHEN undefined_table OR undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.cursor_remote_commands DROP CONSTRAINT cursor_remote_commands_created_by_fkey;
  ALTER TABLE public.cursor_remote_commands
    ADD CONSTRAINT cursor_remote_commands_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;
EXCEPTION WHEN undefined_table OR undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.trusted_sources DROP CONSTRAINT trusted_sources_created_by_fkey;
  ALTER TABLE public.trusted_sources
    ADD CONSTRAINT trusted_sources_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;
EXCEPTION WHEN undefined_table OR undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.teams DROP CONSTRAINT teams_managed_by_fkey;
  ALTER TABLE public.teams
    ADD CONSTRAINT teams_managed_by_fkey FOREIGN KEY (managed_by) REFERENCES public.users(id) ON DELETE SET NULL;
EXCEPTION WHEN undefined_table OR undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.ai_helper_entries DROP CONSTRAINT ai_helper_entries_created_by_fkey;
  ALTER TABLE public.ai_helper_entries
    ADD CONSTRAINT ai_helper_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;
  ALTER TABLE public.ai_helper_entries DROP CONSTRAINT ai_helper_entries_updated_by_fkey;
  ALTER TABLE public.ai_helper_entries
    ADD CONSTRAINT ai_helper_entries_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE CASCADE;
EXCEPTION WHEN undefined_table OR undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.research_feedback DROP CONSTRAINT research_feedback_user_id_fkey;
  ALTER TABLE public.research_feedback
    ADD CONSTRAINT research_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
EXCEPTION WHEN undefined_table OR undefined_object THEN NULL;
END $$;
