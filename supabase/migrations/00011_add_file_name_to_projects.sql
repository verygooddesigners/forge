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
