import fetch from 'node-fetch';

const execSqlFunctionSql = `
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
`;

const urlColumnMigrationSql = `
ALTER TABLE library_items
ADD COLUMN IF NOT EXISTS url TEXT;

CREATE INDEX IF NOT EXISTS idx_library_items_url
ON library_items(url);

ALTER TABLE library_items
ADD CONSTRAINT IF NOT EXISTS chk_youtube_url
CHECK ((type = 'youtube' AND url IS NOT NULL) OR (type != 'youtube'));
`;

async function createExecSql() {
  const supabaseUrl = 'https://shjwvwhijgehquuteekv.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9zSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc3NTAxNSwiZXhwIjoyMDQ5MzUxMDE1fQ.KTTyuF4MarEm0YCCvsTca5geQLc6RfeSb1pVfz-92QI';

  try {
    // Create exec_sql function
    const functionResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        command: execSqlFunctionSql
      })
    });

    if (!functionResponse.ok) {
      const functionError = await functionResponse.text();
      console.error('Function creation response:', functionError);

      // If exec_sql doesn't exist yet, try direct SQL execution
      const directSqlResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Accept': 'application/json',
          'Prefer': 'params=single-object'
        },
        body: JSON.stringify({
          query: execSqlFunctionSql
        })
      });

      if (!directSqlResponse.ok) {
        const directError = await directSqlResponse.text();
        throw new Error(`Failed to create exec_sql function: ${directError}`);
      }
    }

    console.log('exec_sql function created successfully');

    // Apply URL column migration
    const migrationResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        command: urlColumnMigrationSql
      })
    });

    if (!migrationResponse.ok) {
      const migrationError = await migrationResponse.text();
      throw new Error(`Failed to apply URL column migration: ${migrationError}`);
    }

    console.log('URL column migration applied successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createExecSql();
