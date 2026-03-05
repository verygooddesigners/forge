-- =============================================================================
-- Super Admin: full access to all projects
-- =============================================================================
-- 1. Update is_admin() to also return true for Super Administrators so that
--    ALL existing policies that call is_admin() automatically cover super admins.
-- 2. The existing projects SELECT/UPDATE/DELETE policies already use is_admin(),
--    so once we fix is_admin() those policies will cover super admins too.
-- =============================================================================

CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'Super Administrator')
  FROM public.users
  WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;
