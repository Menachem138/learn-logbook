create table if not exists public.device_tokens (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    token text not null,
    platform text not null,
    last_used timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, token)
);

-- Enable RLS
alter table public.device_tokens enable row level security;

-- Create policies
create policy "Users can insert their own device tokens"
    on public.device_tokens for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own device tokens"
    on public.device_tokens for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can view their own device tokens"
    on public.device_tokens for select
    using (auth.uid() = user_id);

create policy "Users can delete their own device tokens"
    on public.device_tokens for delete
    using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger handle_device_tokens_updated_at
    before update on public.device_tokens
    for each row
    execute procedure public.handle_updated_at();
