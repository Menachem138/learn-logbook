import path from 'path';
import { fileURLToPath } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
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

async function executeSql(sql: string, description: string) {
  console.log(`Executing SQL: ${description}...`);

  try {
    // Use rpc endpoint to execute SQL directly
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    });

    if (error) {
      console.error(`Error executing SQL: ${description}:`, error);
      throw error;
    }

    console.log(`Successfully executed SQL: ${description}`);
  } catch (error) {
    console.error(`Failed to execute SQL: ${description}:`, error);
    throw error;
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

  // Split SQL into statements, preserving function definitions
  const statements = sql.split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await executeSql(statement, `${description} - statement`);
    } catch (error) {
      console.error(`Error executing migration statement:`, error);
      throw error;
    }
  }

  console.log(`Successfully executed migration: ${description}`);
}

async function applyMigrations() {
  console.log('\nStarting migration process...');

  try {
    // First create exec_sql function if it doesn't exist
    await executeSql(`
      CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$;
    `, 'create exec_sql function');

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
