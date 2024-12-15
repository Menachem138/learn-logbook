import { initializeSchema } from '../src/integrations/supabase/client.ts';

async function init() {
  try {
    const { error } = await initializeSchema();
    if (error) {
      console.error('Failed to initialize schema:', error);
      process.exit(1);
    }
    console.log('Schema initialized successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

init();
