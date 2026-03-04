-- Migration: 20260304_beta_scheduling.sql
-- Add scheduled_start_at and scheduled_end_at to betas for advance scheduling

ALTER TABLE betas
  ADD COLUMN IF NOT EXISTS scheduled_start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scheduled_end_at   TIMESTAMPTZ;
