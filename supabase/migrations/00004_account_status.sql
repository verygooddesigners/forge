-- Add account_status field to users table
-- This replaces the existing role field with a more comprehensive status system

-- First, add the account_status column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending';

-- Update existing users to convert their role to account_status
-- Existing users with roles should be considered active (not pending)
UPDATE public.users 
SET account_status = role 
WHERE account_status = 'pending';

-- Create a check constraint to ensure valid account_status values
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_account_status_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_account_status_check 
CHECK (account_status IN ('pending', 'strategist', 'editor', 'admin'));

-- Update the handle_new_user function to set default status as pending
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, account_status)
  VALUES (
    NEW.id,
    NEW.email,
    'strategist', -- Default role for backwards compatibility
    'pending' -- New users start as pending
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for faster queries on account_status
CREATE INDEX IF NOT EXISTS idx_users_account_status ON public.users(account_status);

-- Comment on the column
COMMENT ON COLUMN public.users.account_status IS 'User account status: pending (awaiting admin approval), strategist, editor, or admin';

