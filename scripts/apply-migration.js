import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://shjwvwhijgehquuteekv.supabase.co'
const supabaseClient = createClient(supabaseUrl, '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Authorization': `Basic ${Buffer.from(process.env.supabaseusername + ':' + process.env.supabasepassword).toString('base64')}`
    }
  }
})

const migration = `
  ALTER TABLE library_items
  ADD COLUMN IF NOT EXISTS url TEXT;

  CREATE INDEX IF NOT EXISTS idx_library_items_url
  ON library_items(url);

  ALTER TABLE library_items
  ADD CONSTRAINT IF NOT EXISTS chk_youtube_url
  CHECK ((type = 'youtube' AND url IS NOT NULL) OR (type != 'youtube'));
`

async function applyMigration() {
  try {
    console.log('Connected successfully, applying migration...')

    const { data, error } = await supabaseClient
      .from('_sql')
      .select('*')
      .eq('query', migration)
      .single()

    if (error) {
      console.error('Migration failed:', error)
      process.exit(1)
    }

    console.log('Migration successful!')
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

applyMigration()
