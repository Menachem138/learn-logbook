import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

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
  try {
    // First test basic REST API connectivity
    console.log('Testing basic REST API connectivity...');
    const healthCheck = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });

    if (!healthCheck.ok) {
      throw new Error(`Health check failed with status ${healthCheck.status}`);
    }

    console.log('Basic REST API connectivity successful');

    // Now test Supabase client
    console.log('\nTesting Supabase client...');
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

    // Try to get schema information
    const { data, error } = await supabase
      .rpc('postgres_raw_query', {
        query: 'SELECT current_schema()'
      });

    if (error) {
      console.log('RPC function not available yet (expected):', error.message);
    } else {
      console.log('Current schema:', data);
    }

    console.log('\nBasic Supabase connection test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\nSupabase connection test failed:', error);
    process.exit(1);
  }
}

testSupabaseConnection();
