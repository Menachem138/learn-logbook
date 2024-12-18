import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testConnection() {
  console.log('Testing Supabase connection...');

  // Initialize Supabase client with service role key
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables:');
    console.error('SUPABASE_URL:', !!supabaseUrl);
    console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
    process.exit(1);
  }

  console.log('Using Supabase URL:', supabaseUrl);

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  });

  try {

    // Try a simple query first
    console.log('\nTesting simple query...');
    const { data: testData, error: testError } = await supabase
      .from('content_items')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('Simple query failed:', testError);
      console.error('Error details:', JSON.stringify(testError, null, 2));
    } else {
      console.log('Simple query successful. Row count:', testData?.length);
      if (testData?.length > 0) {
        console.log('Sample data structure:', Object.keys(testData[0]));
      }
    }

    // Log connection details
    console.log('\nConnection Details:');
    console.log('URL:', supabaseUrl);
    console.log('Service Role Key (first 10 chars):', supabaseServiceKey?.substring(0, 10) + '...');

    // Try listing tables
    console.log('\nTesting table list query...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables');

    if (tablesError) {
      console.error('Table list query failed:', tablesError);
    } else {
      console.log('Available tables:', tables);
    }

    // Log the keys being used (but not their full values for security)
    console.log('\nAPI Keys being used (first 10 chars):');
    console.log('Service Role:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + '...');
    console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...');

  } catch (error) {
    console.error('Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
