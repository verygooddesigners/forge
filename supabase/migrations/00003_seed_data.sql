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


