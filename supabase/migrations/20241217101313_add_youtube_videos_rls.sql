-- Drop existing policies
drop policy if exists "Enable public read access" on youtube_videos;
drop policy if exists "Enable public insert access" on youtube_videos;
drop policy if exists "Enable public delete access" on youtube_videos;

-- Create new user-specific policies
create policy "Users can view their own videos"
on youtube_videos for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own videos"
on youtube_videos for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete their own videos"
on youtube_videos for delete
to authenticated
using (auth.uid() = user_id);