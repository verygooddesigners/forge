-- Migration: 00026_betas.sql
-- Beta management: named betas with user invitations and notes

CREATE TABLE IF NOT EXISTS betas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  notes TEXT DEFAULT '',
  notes_version INTEGER DEFAULT 1,
  notes_is_major_update BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended')),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS beta_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  beta_id UUID REFERENCES betas(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_id UUID,
  invited_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  last_seen_notes_version INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(beta_id, email)
);

ALTER TABLE betas ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_users ENABLE ROW LEVEL SECURITY;

-- Users can read active betas they belong to
CREATE POLICY "Users can read active betas they belong to" ON betas
  FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM beta_users bu
      WHERE bu.beta_id = betas.id
      AND (
        bu.user_id = auth.uid()
        OR bu.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

-- Users can read their own beta membership row
CREATE POLICY "Users can read their own beta membership" ON beta_users
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can update their own beta membership (acknowledging notes)
CREATE POLICY "Users can update their own beta membership" ON beta_users
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
