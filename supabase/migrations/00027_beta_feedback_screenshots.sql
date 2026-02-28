-- Add screenshot_url to beta_feedback
alter table public.beta_feedback
  add column if not exists screenshot_url text;

-- Create storage bucket for bug screenshots
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bug-screenshots',
  'bug-screenshots',
  true,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "Authenticated users can upload bug screenshots"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'bug-screenshots');

-- Anyone can view bug screenshots (public bucket)
create policy "Public can view bug screenshots"
  on storage.objects for select
  to public
  using (bucket_id = 'bug-screenshots');

-- Users can delete their own screenshots
create policy "Users can delete own bug screenshots"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'bug-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);
