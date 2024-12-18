import { createClient } from '@supabase/supabase-js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
    db: { schema: 'public' }
  }
);

async function createRawQueryFunction() {
  console.log('Creating postgres_raw_query function...');
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION postgres_raw_query(query text)
    RETURNS VOID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE query;
    END;
    $$;
  `;

  try {
    // Create function directly through SQL endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: createFunctionSQL })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create function via SQL endpoint:', errorText);
      throw new Error(`Failed to create function: ${errorText}`);
    }

    console.log('Successfully created postgres_raw_query function');
  } catch (e) {
    console.error('Failed to create function:', e);
    throw e;
  }
}

async function readMigrationFile(filename: string): Promise<string> {
  const filePath = path.resolve(__dirname, '../supabase/migrations', filename);
  return readFile(filePath, 'utf-8');
}

async function executeMigration(sql: string, description: string) {
  console.log(`Executing migration: ${description}...`);

  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  for (const statement of statements) {
    const { error } = await supabase.rpc('postgres_raw_query', {
      query: statement
    });

    if (error) {
      console.error(`Error in ${description}:`, error);
      throw error;
    }
  }

  console.log(`Successfully completed: ${description}`);
}

async function applyMigrations() {
  try {
    console.log('Starting migration process...');
    await createRawQueryFunction();

    const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
    const migrationFiles = await readdir(migrationsDir);

    const sortedFiles = migrationFiles
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of sortedFiles) {
      const description = `Applying migration: ${file}`;
      console.log(description);

      const filePath = path.resolve(migrationsDir, file);
      const sql = await readMigrationFile(filePath);

      try {
        await executeMigration(sql, description);
      } catch (error) {
        console.error(`Error in migration ${file}:`, error);
        throw error;
      }
    }

    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
    throw error;
  }
}

// Handle errors
process.on('unhandledRejection', error => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Run migrations
applyMigrations().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
