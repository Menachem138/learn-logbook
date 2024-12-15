import fetch from 'node-fetch';

const migration = `
  ALTER TABLE library_items
  ADD COLUMN IF NOT EXISTS url TEXT;

  CREATE INDEX IF NOT EXISTS idx_library_items_url
  ON library_items(url);

  ALTER TABLE library_items
  ADD CONSTRAINT IF NOT EXISTS chk_youtube_url
  CHECK ((type = 'youtube' AND url IS NOT NULL) OR (type != 'youtube'));
`;

async function applyMigration() {
  const supabaseUrl = 'https://shjwvwhijgehquuteekv.supabase.co';
  const supabaseKey = process.env.supabasepassword;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query: migration })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Migration failed:', error);
      process.exit(1);
    }

    console.log('Migration applied successfully');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration();
