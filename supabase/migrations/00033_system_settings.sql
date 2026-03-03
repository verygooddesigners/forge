-- Migration: 00033_system_settings.sql
-- Description: Create system_settings table for admin-managed app configuration (e.g. API keys)

CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION update_system_settings_updated_at();

-- Enable RLS — only service role (server-side) and admins can touch this table
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Admins can read and write
CREATE POLICY "Admins can manage system settings"
  ON public.system_settings FOR ALL
  USING (is_admin(auth.uid()));
