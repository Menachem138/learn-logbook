import { supabaseAdmin, initializeSchema } from '../src/integrations/supabase/client';

const execSqlFunctionSql = `
-- Create a function to execute SQL commands
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
`;

async function setupSchema() {
  try {
    // First try to create the exec_sql function
    const { data: functionData, error: functionError } = await supabaseAdmin.rpc('exec_sql', {
      query: execSqlFunctionSql
    });

    if (functionError) {
      console.error('Failed to create exec_sql function:', functionError);
      // Try direct SQL execution if RPC fails
      const { data, error: sqlError } = await supabaseAdmin.from('library_items')
        .select('*')
        .limit(1);

      if (sqlError) {
        console.error('Failed to access database:', sqlError);
        return;
      }
    }

    // Then initialize the schema (add URL column etc)
    const { error: schemaError } = await initializeSchema();

    if (schemaError) {
      console.error('Failed to initialize schema:', schemaError);
      return;
    }

    console.log('Schema setup completed successfully');
  } catch (error) {
    console.error('Error during schema setup:', error);
  }
}

setupSchema();
