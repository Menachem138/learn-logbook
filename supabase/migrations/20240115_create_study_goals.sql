create table public.study_goals (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  deadline timestamp with time zone,
  completed boolean default false,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.study_goals enable row level security;

create policy "Users can view their own goals"
  on public.study_goals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own goals"
  on public.study_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on public.study_goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on public.study_goals for delete
  using (auth.uid() = user_id);
