import { supabaseAdmin, initializeSchema } from '../src/integrations/supabase/client.ts';

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
    // First create the exec_sql function
    const { error: functionError } = await supabaseAdmin.rpc('exec_sql', {
      query: execSqlFunctionSql
    }).catch(e => ({ error: e }));

    if (functionError) {
      // If exec_sql doesn't exist yet, try direct SQL execution
      const { error: directError } = await supabaseAdmin.rpc('exec_sql_direct', {
        sql: execSqlFunctionSql
      }).catch(e => ({ error: e }));

      if (directError) {
        console.error('Failed to create exec_sql function:', directError);
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
