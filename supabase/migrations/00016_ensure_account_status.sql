-- Migration: 00016_ensure_account_status.sql
-- Description: Ensure account_status column exists with correct values and constraints.
-- This is a defensive migration in case 00013 was not fully applied.

-- Add column if it doesn't already exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'awaiting_confirmation';

-- Drop constraint first so the UPDATEs below are not blocked by the old allowed-values list
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_account_status_check;

-- Migrate any old status values to the new two-value system
UPDATE public.users
SET account_status = CASE
  WHEN account_status IN ('confirmed', 'active', 'admin', 'strategist', 'editor') THEN 'confirmed'
  ELSE 'awaiting_confirmation'
END
WHERE account_status NOT IN ('awaiting_confirmation', 'confirmed');

-- Set NOT NULL (safe after backfill above)
UPDATE public.users SET account_status = 'awaiting_confirmation' WHERE account_status IS NULL;
ALTER TABLE public.users ALTER COLUMN account_status SET NOT NULL;
ALTER TABLE public.users ALTER COLUMN account_status SET DEFAULT 'awaiting_confirmation';

-- Re-add constraint with the correct two allowed values
ALTER TABLE public.users ADD CONSTRAINT users_account_status_check
  CHECK (account_status IN ('awaiting_confirmation', 'confirmed'));

-- Force PostgREST to reload its schema cache so the column is immediately visible
NOTIFY pgrst, 'reload schema';
