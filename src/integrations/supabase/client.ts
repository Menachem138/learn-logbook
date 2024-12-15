import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables:', {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY ? '[HIDDEN]' : undefined
  });
  throw new Error('Required environment variables are missing');
}

// Regular client for frontend operations
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Initialize database schema
export const initializeSchema = async () => {
  const sql = `
    ALTER TABLE library_items
    ADD COLUMN IF NOT EXISTS url TEXT;

    CREATE INDEX IF NOT EXISTS idx_library_items_url
    ON library_items(url);

    ALTER TABLE library_items
    ADD CONSTRAINT IF NOT EXISTS chk_youtube_url
    CHECK ((type = 'youtube' AND url IS NOT NULL) OR (type != 'youtube'));
  `;

  try {
    // Try direct SQL execution first
    const { data, error: sqlError } = await supabase.rpc('exec_sql', { query: sql });

    if (sqlError) {
      console.error('Error executing SQL:', sqlError);

      // Try alternative approach using REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('REST API error:', error);
        return { error };
      }
    }

    return { error: null };
  } catch (err) {
    console.error('Error during schema initialization:', err);
    return { error: err };
  }
};
