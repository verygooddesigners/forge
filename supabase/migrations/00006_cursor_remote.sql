-- Migration: 00006_cursor_remote.sql
-- Description: Cursor remote commands + agent status

CREATE TABLE public.cursor_remote_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  command_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES public.users(id),
  target_agent_id TEXT,
  claimed_by TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result_text TEXT,
  error_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.cursor_agent_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'offline',
  current_task TEXT,
  last_message TEXT,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_cursor_remote_commands_status ON public.cursor_remote_commands(status);
CREATE INDEX idx_cursor_remote_commands_created_at ON public.cursor_remote_commands(created_at DESC);
CREATE INDEX idx_cursor_remote_commands_target_agent ON public.cursor_remote_commands(target_agent_id);
CREATE INDEX idx_cursor_agent_status_heartbeat ON public.cursor_agent_status(last_heartbeat DESC);

ALTER TABLE public.cursor_remote_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursor_agent_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage cursor commands"
  ON public.cursor_remote_commands FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can manage cursor agent status"
  ON public.cursor_agent_status FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE TRIGGER update_cursor_remote_commands_updated_at
  BEFORE UPDATE ON public.cursor_remote_commands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cursor_agent_status_updated_at
  BEFORE UPDATE ON public.cursor_agent_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
