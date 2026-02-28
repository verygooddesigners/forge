-- Migration 00028: Fix handle_new_user trigger to handle email conflicts
--
-- Problem: public.users has a UNIQUE constraint on email.
-- When inviteUserByEmail or generateLink creates a new auth.users record,
-- the handle_new_user trigger fires and tries to INSERT the email into
-- public.users. If that email already exists (with a different UUID),
-- the insert fails and Supabase surfaces it as "Database error saving new user",
-- which blocks ALL invite/auth operations for that address.
--
-- Fix: use ON CONFLICT DO NOTHING so any unique constraint conflict
-- (id OR email) is silently ignored and the auth user creation succeeds.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, account_status)
  VALUES (
    NEW.id,
    NEW.email,
    'Content Creator',
    'awaiting_confirmation'
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
