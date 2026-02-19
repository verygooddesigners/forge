-- Add description column to briefs table
-- Note: Until this migration is applied, description is stored in seo_config->>'description'
ALTER TABLE public.briefs
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Migrate any existing descriptions from seo_config JSONB into the proper column
UPDATE public.briefs
  SET description = seo_config->>'description'
  WHERE seo_config->>'description' IS NOT NULL
    AND description IS NULL;
