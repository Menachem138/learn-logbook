import { createClient } from '@supabase/supabase-js';

const migration = `
  ALTER TABLE library_items
  ADD COLUMN IF NOT EXISTS url TEXT;

  CREATE INDEX IF NOT EXISTS idx_library_items_url
  ON library_items(url);

  ALTER TABLE library_items
  ADD CONSTRAINT IF NOT EXISTS chk_youtube_url
  CHECK ((type = 'youtube' AND url IS NOT NULL) OR (type != 'youtube'));
`;

const SUPABASE_URL = 'https://shjwvwhijgehquuteekv.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMjU4NTYwNiwiZXhwIjoyMDE4MTYxNjA2fQ.vPGZT-YdS_uGQJo_-g0yvM-zM-RLxqVHrJeHPAvhXcI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    const { error } = await supabase.rpc('exec_sql', { query: migration });

    if (error) {
      console.error('Error applying migration:', error);
      process.exit(1);
    }

    console.log('Migration applied successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

applyMigration();
