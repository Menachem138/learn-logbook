import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://shjwvwhijgehquuteekv.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc3NTAxNSwiZXhwIjoyMDQ5MzUxMDE1fQ.KTTyuF4MarEm0YCCvsTca5geQLc6RfeSb1pVfz-92QI";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const createVideosTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.videos (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      thumbnail TEXT NOT NULL,
      video_id TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
    );

    ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

    DO $$
    BEGIN
      CREATE POLICY "Users can view their own videos"
        ON public.videos
        FOR SELECT
        USING (auth.uid() = user_id);
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$
    BEGIN
      CREATE POLICY "Users can insert their own videos"
        ON public.videos
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$
    BEGIN
      CREATE POLICY "Users can update their own videos"
        ON public.videos
        FOR UPDATE
        USING (auth.uid() = user_id);
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$
    BEGIN
      CREATE POLICY "Users can delete their own videos"
        ON public.videos
        FOR DELETE
        USING (auth.uid() = user_id);
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  const { error } = await supabase.rpc('exec', { sql });
  if (error) {
    console.error('Error creating videos table:', error);
    process.exit(1);
  }
  console.log('Videos table created successfully');
  process.exit(0);
};

createVideosTable();
