-- Migration 00031: Default account_status to 'confirmed' for new signups
--
-- Previously, the handle_new_user trigger set account_status = 'awaiting_confirmation'
-- for all new users, requiring them to be manually confirmed via the beta admin panel.
-- This caused super admins and other users to be blocked by the confirmation gate.
--
-- Fix: Change the default to 'confirmed' so all authenticated users can access
-- the dashboard immediately after signup. Beta membership (beta_users table) controls
-- feature access separately from account access.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.users (id, email, role, account_status)
    VALUES (
      NEW.id,
      NEW.email,
      'Content Creator',
      'confirmed'
    )
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: suppressed error for %: %', NEW.email, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also fix any existing users still stuck on awaiting_confirmation
UPDATE public.users
SET account_status = 'confirmed'
WHERE account_status = 'awaiting_confirmation';
