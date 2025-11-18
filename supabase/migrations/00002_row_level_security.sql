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


