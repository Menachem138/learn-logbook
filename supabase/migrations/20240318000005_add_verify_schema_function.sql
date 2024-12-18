-- Function to verify Cloudinary schema is properly set up
CREATE OR REPLACE FUNCTION verify_cloudinary_schema()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    content_columns_exist boolean;
    library_columns_exist boolean;
    indexes_exist boolean;
BEGIN
    -- Check content_items columns
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'content_items'
        AND column_name IN ('cloudinary_public_id', 'cloudinary_url')
        GROUP BY table_name
        HAVING COUNT(*) = 2
    ) INTO content_columns_exist;

    -- Check library_items columns
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'library_items'
        AND column_name = 'cloudinary_data'
    ) INTO library_columns_exist;

    -- Check indexes
    SELECT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'content_items'
        AND indexname IN ('idx_content_items_cloudinary_public_id', 'idx_content_items_cloudinary_url')
        GROUP BY tablename
        HAVING COUNT(*) = 2
    ) INTO indexes_exist;

    -- Return true only if all checks pass
    RETURN content_columns_exist AND library_columns_exist AND indexes_exist;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION verify_cloudinary_schema TO service_role;
