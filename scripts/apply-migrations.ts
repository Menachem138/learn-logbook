import path from 'path';
import { fileURLToPath } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/postgrest-js';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Required environment variables are not set');
}

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public'
    }
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

  // Use hostname for SSL verification but IP for connection
  const dbHostname = 'db.shjwvwhijgehquuteekv.supabase.co';
  const dbIp = '52.204.196.254';

  const client = new pg.Client({
    user: 'postgres',
    password: process.env.SUPABASE_SERVICE_ROLE_KEY,
    host: dbIp,
    port: 5432,
    database: 'postgres',
    ssl: {
      rejectUnauthorized: true,
      servername: dbHostname
    },
    connectionTimeoutMillis: 10000,
    query_timeout: 5000,
    statement_timeout: 5000
  });

  try {
    // Wrap connection in a timeout promise
    const connectWithTimeout = async () => {
      return Promise.race([
        client.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
        )
      ]);
    };

    await connectWithTimeout();
    console.log('Connected to database directly');

    await client.query(createFunctionSQL);
    console.log('Successfully created postgres_raw_query function');
  } catch (e) {
    console.error('Failed to create function:', e);
    throw e;
  } finally {
    await client.end();
  }
}

async function readMigrationFile(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading migration file ${filePath}:`, error);
    throw error;
  }
}

async function executeMigration(sql: string, description: string) {
  console.log(`Executing migration: ${description}...`);
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    const { error } = await supabase.rpc('postgres_raw_query', {
      query: statement
    });

    if (error) {
      console.error(`Error executing migration statement:`, error);
      throw error;
    }
  }
  console.log(`Successfully executed migration: ${description}`);
}

async function applyMigrations() {
  console.log('\nStarting migration process...');

  try {
    await createRawQueryFunction();

    const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
    const migrationFiles = await readdir(migrationsDir);

    // Sort files to ensure consistent order
    const sortedFiles = migrationFiles
      .filter(file => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    for (const file of sortedFiles) {
      const description = path.basename(file, '.sql');
      const filePath = path.resolve(migrationsDir, file);
      const sql = await readMigrationFile(filePath);

      try {
        await executeMigration(sql, description);
      } catch (error) {
        console.error(`Failed to apply migration ${file}:`, error);
        throw error;
      }
    }

    console.log('\nAll migrations completed successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
    throw error;
  }
}

// Error handlers
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run migrations
applyMigrations().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
