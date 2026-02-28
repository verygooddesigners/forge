-- Migration 00029: Add EXCEPTION wrapper to handle_new_user trigger
--
-- Problem: Even with ON CONFLICT DO NOTHING (migration 00028), the trigger
-- was still propagating errors to the auth layer in some edge cases, causing
-- "Database error saving new user" to surface in Supabase's invite/auth flows.
--
-- Fix: Wrap the INSERT in a BEGIN/EXCEPTION block so ANY error in the trigger
-- is suppressed and logged as a WARNING rather than propagated upward.
-- The auth user is always created successfully regardless of trigger outcome.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.users (id, email, role, account_status)
    VALUES (
      NEW.id,
      NEW.email,
      'Content Creator',
      'awaiting_confirmation'
    )
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: suppressed error for %: %', NEW.email, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
