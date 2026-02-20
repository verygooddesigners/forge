-- Migration: 00019_applied_dynamic_roles.sql
-- Description: Documents that migration 00018 was applied manually to the
--              Forge Supabase project (hjnmeaklpgcjwzafakwt).
--
-- The following changes were applied via the Supabase management API on 2026-02-20:
--
-- 1. Converted users.role from user_role ENUM (admin/strategist/editor) to TEXT
--    with display names (Super Administrator/Administrator/Content Creator/Team Leader)
-- 2. Created roles table with 5 initial roles seeded
-- 3. Updated role_permissions to use display name keys
-- 4. Created has_permission() and is_super_admin() SQL functions
-- 5. Rewrote all RLS policies to use has_permission()
-- 6. Added is_tool_creator column to users
--
-- This file is a no-op (idempotent) - the actual changes are already applied.

SELECT 1; -- no-op
