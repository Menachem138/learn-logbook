import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import pg from 'pg';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    db: { schema: 'public' }
  }
);

// Extract project reference from URL
const projectRef = process.env.SUPABASE_URL!.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  throw new Error('Could not extract project reference from SUPABASE_URL');
}

// Construct connection string for direct Postgres connection
const connectionString = `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@db.${projectRef}.supabase.co:5432/postgres`;

async function readMigrationFile(filename: string): Promise<string> {
  const filePath = path.resolve(__dirname, '../supabase/migrations', filename);
  return fs.readFileSync(filePath, 'utf8');
}

async function createMigrationFunction() {
  console.log('Creating migration function...');
  const migrationFunctionSQL = await readMigrationFile('20240318000002_add_migration_function.sql');

  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: true
    }
  });

  try {
    await client.connect();
    await client.query(migrationFunctionSQL);
    console.log('Successfully created migration function');
  } catch (error) {
    console.error('Error creating migration function:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function executeMigration(sql: string, description: string) {
  console.log(`Executing migration: ${description}...`);
  const { error } = await supabase.rpc('execute_migration', { query_text: sql });
  if (error) {
    console.error(`Error in ${description}:`, error);
    throw error;
  }
  console.log(`Successfully completed: ${description}`);
}

async function applyMigrations() {
  try {
    console.log('Starting migration process...');

    // First create the execute_migration function directly
    await createMigrationFunction();

    // Create base tables and RLS policies
    const baseTablesSQL = await readMigrationFile('20240318000006_create_base_tables.sql');
    await executeMigration(baseTablesSQL, 'Creating base tables and policies');

    // Add Cloudinary columns
    const cloudinaryColumnsSQL = await readMigrationFile('20240318000003_add_cloudinary_columns.sql');
    await executeMigration(cloudinaryColumnsSQL, 'Adding Cloudinary columns');

    // Add Cloudinary schema function
    const schemaFunctionSQL = await readMigrationFile('20240318000004_add_cloudinary_schema_function.sql');
    await executeMigration(schemaFunctionSQL, 'Adding Cloudinary schema function');

    // Add verify schema function
    const verifySchemaSQL = await readMigrationFile('20240318000005_add_verify_schema_function.sql');
    await executeMigration(verifySchemaSQL, 'Adding verify schema function');

    // Verify the schema is correctly set up
    console.log('Verifying schema setup...');
    const { data: schemaVerified, error: verifyError } = await supabase.rpc('verify_cloudinary_schema');

    if (verifyError) {
      console.error('Error verifying schema:', verifyError);
      throw verifyError;
    }

    if (!schemaVerified) {
      throw new Error('Schema verification failed - some required elements are missing');
    }

    console.log('Schema verification successful');
    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
}

// Execute migrations
console.log('Starting migration application process...');
applyMigrations().catch(error => {
  console.error('Fatal error during migration:', error);
  process.exit(1);
});
