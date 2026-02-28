-- Beta feedback table for bug reports and feature suggestions
create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text,
  type text not null check (type in ('bug', 'feature')),
  title text not null,
  description text not null,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'planned', 'in_progress', 'completed', 'wont_fix')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.beta_feedback enable row level security;

-- Users can insert their own feedback
create policy "Users can create feedback"
  on public.beta_feedback for insert
  with check (auth.uid() = user_id);

-- Users can read their own feedback
create policy "Users can view own feedback"
  on public.beta_feedback for select
  using (auth.uid() = user_id);

-- Super admins can read all feedback (handled in API route with service role)
-- Updated_at trigger
create or replace function public.update_beta_feedback_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger beta_feedback_updated_at
  before update on public.beta_feedback
  for each row execute function public.update_beta_feedback_updated_at();
