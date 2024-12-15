const fetch = require('node-fetch');

const SUPABASE_URL = 'https://shjwvwhijgehquuteekv.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMjU4NTYwNiwiZXhwIjoyMDE4MTYxNjA2fQ.vPGZT-YdS_uGQJo_-g0yvM-zM-RLxqVHrJeHPAvhXcI';

const sql = `
  ALTER TABLE library_items
  ADD COLUMN IF NOT EXISTS url TEXT;

  CREATE INDEX IF NOT EXISTS idx_library_items_url
  ON library_items(url);

  ALTER TABLE library_items
  ADD CONSTRAINT IF NOT EXISTS chk_youtube_url
  CHECK ((type = 'youtube' AND url IS NOT NULL) OR (type != 'youtube'));
`;

async function runMigration() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Migration failed:', error);
      process.exit(1);
    }

    console.log('Migration applied successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

runMigration();
