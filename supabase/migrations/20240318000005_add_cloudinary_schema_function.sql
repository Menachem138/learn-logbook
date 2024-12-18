-- Function to apply Cloudinary schema changes
CREATE OR REPLACE FUNCTION apply_cloudinary_schema()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add Cloudinary-specific columns if they don't exist
  ALTER TABLE content_items
  ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT,
  ADD COLUMN IF NOT EXISTS cloudinary_url TEXT;

  ALTER TABLE library_items
  ADD COLUMN IF NOT EXISTS cloudinary_data JSONB;

  -- Create indexes if they don't exist
  CREATE INDEX IF NOT EXISTS idx_content_items_cloudinary_public_id
  ON content_items(cloudinary_public_id);

  CREATE INDEX IF NOT EXISTS idx_content_items_cloudinary_url
  ON content_items(cloudinary_url);
END;
$$;
