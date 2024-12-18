import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');

    const supabaseUrl = 'https://shjwvwhijgehquuteekv.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
    }

    console.log('Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test database access directly (no auth needed with service role)
    console.log('\nTesting database access...');
    const { data: tables, error: tablesError } = await supabase
      .from('content_items')
      .select('id')
      .limit(1);

    if (tablesError) {
      throw new Error(`Database access failed: ${tablesError.message}`);
    }
    console.log('Successfully accessed content_items table');

    // Test storage access
    console.log('\nTesting storage access...');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      throw new Error(`Storage access failed: ${bucketsError.message}`);
    }
    console.log('Available storage buckets:', buckets.map(b => b.name).join(', '));

    // Test RPC functions
    console.log('\nTesting RPC functions...');
    const { error: rpcError } = await supabase
      .rpc('verify_cloudinary_schema');

    if (rpcError) {
      console.log('Note: verify_cloudinary_schema function not available yet (this is expected)');
    } else {
      console.log('Successfully called verify_cloudinary_schema function');
    }

    console.log('\nAll connection tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nConnection test failed:', error.message);
    process.exit(1);
  }
}

testSupabaseConnection();
