import { initializeSchema } from '../src/integrations/supabase/client.ts';

async function init() {
  try {
    const result = await initializeSchema();
    if (result.error) {
      console.error('Failed to initialize schema:', result.error);
      process.exit(1);
    }
    console.log('Schema initialized successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

init();
