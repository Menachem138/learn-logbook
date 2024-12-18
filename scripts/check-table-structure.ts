import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkTableStructure() {
  try {
    console.log('Checking table structure...');

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Query table structure
    const { data, error } = await supabase
      .rpc('check_table_structure', {
        table_name: 'content_items'
      });

    if (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }

    console.log('\nTable structure:', JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Failed to check table structure:', error);
    process.exit(1);
  }
}

checkTableStructure();
