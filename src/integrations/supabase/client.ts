import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://shjwvwhijgehquuteekv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3MzM3NzUwMTUsImV4cCI6MjA0OTM1MTAxNX0.ZNdvVHgBHMpXbzE_4HkDGt4EXqp2ypgqFq1WTYZGXhE";
const SUPABASE_SERVICE_KEY = process.env.supabasepassword;

// Create admin client for database migrations
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Regular client for frontend operations
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

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
    const { data, error: sqlError } = await supabaseAdmin.rpc('exec_sql', { query: sql });

    if (sqlError) {
      console.error('Error executing SQL:', sqlError);

      // Try alternative approach using REST API
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
