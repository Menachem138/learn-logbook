create table if not exists public.user_push_tokens (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  push_token text not null,
  platform text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, push_token)
);

-- Add RLS policies
alter table public.user_push_tokens enable row level security;

-- Allow users to see their own tokens
create policy "Users can view their own push tokens"
  on public.user_push_tokens for select
  using (auth.uid() = user_id);

-- Allow users to insert their own tokens
create policy "Users can insert their own push tokens"
  on public.user_push_tokens for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own tokens
create policy "Users can update their own push tokens"
  on public.user_push_tokens for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow users to delete their own tokens
create policy "Users can delete their own push tokens"
  on public.user_push_tokens for delete
  using (auth.uid() = user_id);

-- Create index for faster lookups
create index user_push_tokens_user_id_idx on public.user_push_tokens(user_id);
create index user_push_tokens_token_idx on public.user_push_tokens(push_token);
