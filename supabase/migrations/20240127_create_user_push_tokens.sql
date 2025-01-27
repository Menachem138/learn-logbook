create table if not exists public.user_push_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  push_token text not null,
  device_type text not null check (device_type in ('ios', 'android', 'web')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, push_token)
);

-- Enable RLS
alter table public.user_push_tokens enable row level security;

-- Create policies
create policy "Users can insert their own push tokens"
  on public.user_push_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own push tokens"
  on public.user_push_tokens for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own push tokens"
  on public.user_push_tokens for delete
  using (auth.uid() = user_id);

create policy "Users can view their own push tokens"
  on public.user_push_tokens for select
  using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create trigger for updated_at
create trigger handle_updated_at
  before update on public.user_push_tokens
  for each row
  execute function public.handle_updated_at();

-- Create function to send push notification
create or replace function public.send_push_notification(user_ids uuid[], title text, body text, data jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Call edge function to send push notification
  perform net.http_post(
    url := current_setting('app.settings.edge_function_url') || '/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'user_ids', user_ids,
      'notification', jsonb_build_object(
        'title', title,
        'body', body,
        'data', data
      )
    )
  );
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.send_push_notification to authenticated;
