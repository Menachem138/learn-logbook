create table if not exists public.notification_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  token text not null,
  device_id text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, device_id)
);

-- Add RLS policies
alter table public.notification_tokens enable row level security;

create policy "Users can insert their own notification tokens"
  on public.notification_tokens
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notification tokens"
  on public.notification_tokens
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own notification tokens"
  on public.notification_tokens
  for delete
  using (auth.uid() = user_id);

create policy "Users can view their own notification tokens"
  on public.notification_tokens
  for select
  using (auth.uid() = user_id);

-- Add updated_at trigger
create trigger handle_updated_at before update on notification_tokens
  for each row execute procedure moddatetime (updated_at);
