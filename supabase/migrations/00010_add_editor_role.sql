-- Add 'editor' value to the user_role enum
-- This allows users to be assigned the 'editor' role in addition to 'admin' and 'strategist'

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'editor';

-- Update comment on the role column for clarity
COMMENT ON COLUMN public.users.role IS 'User role: admin (full access), strategist (content creator), or editor (content reviewer)';
