-- Create a function to execute migrations with proper permissions
CREATE OR REPLACE FUNCTION execute_migration(query_text TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query_text;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_migration TO authenticated;
