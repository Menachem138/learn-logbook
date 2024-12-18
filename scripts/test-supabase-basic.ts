import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Assert environment variables with type checking
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  if (!SUPABASE_URL) console.error('- NEXT_PUBLIC_SUPABASE_URL');
  if (!SERVICE_ROLE_KEY) console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function testSupabaseConnection() {
  console.log('Testing Supabase connection via REST API...');

  const supabase = createClient(
    SUPABASE_URL,
    SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );

  try {
    // Test basic query
    console.log('Testing basic query...');
    const { data, error } = await supabase
      .from('content_items')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('Query failed:', error.message);
      throw error;
    }

    console.log('Successfully queried database:', data);

    // Test RPC function
    console.log('\nTesting RPC function...');
    const { error: rpcError } = await supabase.rpc('postgres_raw_query', {
      query: 'SELECT 1'
    });

    if (rpcError) {
      console.log('RPC function not available yet (expected):', rpcError.message);
    } else {
      console.log('RPC function exists and works');
    }

    console.log('\nBasic Supabase connection test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\nSupabase connection test failed:', error);
    process.exit(1);
  }
}

testSupabaseConnection();
