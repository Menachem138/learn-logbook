-- Add Cloudinary-specific columns to content_items table
ALTER TABLE content_items
ADD COLUMN cloudinary_public_id TEXT,
ADD COLUMN cloudinary_url TEXT;

-- Add comment to explain the purpose of these columns
COMMENT ON COLUMN content_items.cloudinary_public_id IS 'The public_id of the file in Cloudinary';
COMMENT ON COLUMN content_items.cloudinary_url IS 'The public URL of the file in Cloudinary';

-- Add Cloudinary data column to library_items table
ALTER TABLE library_items
ADD COLUMN cloudinary_data JSONB;

-- Add comment to explain the purpose of this column
COMMENT ON COLUMN library_items.cloudinary_data IS 'Cloudinary-specific metadata including public_id and URL';

-- Create index on cloudinary_public_id for faster lookups
CREATE INDEX idx_content_items_cloudinary_public_id ON content_items(cloudinary_public_id);

-- Create index on cloudinary_data for JSONB operations
CREATE INDEX idx_library_items_cloudinary_data ON library_items USING gin(cloudinary_data);
