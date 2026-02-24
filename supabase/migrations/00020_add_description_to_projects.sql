-- Migration: 00020_add_description_to_projects.sql
-- Description: Add optional description column to projects table for the new project form.

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description TEXT;

NOTIFY pgrst, 'reload schema';
