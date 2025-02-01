import { supabase } from '../src/integrations/supabase/client';

const createYouTubeVideosTable = async () => {
  const sql = `
    create table youtube_videos (
      id uuid default uuid_generate_v4() primary key,
      title text not null,
      url text not null,
      thumbnail_url text not null,
      video_id text not null,
      user_id uuid references auth.users(id),
      created_at timestamp with time zone default timezone('utc'::text, now())
    );
  `;

  const { error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    console.error('Error creating youtube_videos table:', error);
    process.exit(1);
  }

  console.log('Successfully created youtube_videos table');
};

createYouTubeVideosTable();
