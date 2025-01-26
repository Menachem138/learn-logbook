-- Create course_progress table
create table if not exists public.course_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  lesson_id text not null,
  completed boolean default false,
  progress_percentage integer default 0,
  last_accessed timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, lesson_id)
);

-- Create journal_entries table
create table if not exists public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  mood text,
  study_duration integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for course_progress
alter table public.course_progress enable row level security;

create policy "Users can view their own course progress"
  on public.course_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own course progress"
  on public.course_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own course progress"
  on public.course_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Enable RLS for journal_entries
alter table public.journal_entries enable row level security;

create policy "Users can view their own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own journal entries"
  on public.journal_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- Create indexes for better query performance
create index course_progress_user_id_idx on public.course_progress(user_id);
create index course_progress_lesson_id_idx on public.course_progress(lesson_id);
create index journal_entries_user_id_idx on public.journal_entries(user_id);
create index journal_entries_created_at_idx on public.journal_entries(created_at);

-- Enable realtime for both tables
alter publication supabase_realtime add table course_progress;
alter publication supabase_realtime add table journal_entries;
