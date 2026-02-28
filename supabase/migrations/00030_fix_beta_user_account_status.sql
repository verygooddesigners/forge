-- Migration 00030: Fix beta users stuck in 'awaiting_confirmation'
--
-- Problem: provisionUser was setting account_status = 'awaiting_confirmation',
-- which causes the middleware to redirect users to /awaiting-confirmation instead
-- of the dashboard. Since beta users are created with email_confirm: true (no
-- email confirmation required), their status should be 'confirmed' immediately.
--
-- This migration updates all beta users who were stuck in awaiting_confirmation
-- so they can access the dashboard.

UPDATE public.users
SET account_status = 'confirmed'
WHERE account_status = 'awaiting_confirmation'
  AND id IN (
    SELECT DISTINCT user_id
    FROM public.beta_users
    WHERE user_id IS NOT NULL
  );
