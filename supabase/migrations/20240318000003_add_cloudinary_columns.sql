-- Add Cloudinary-specific columns to content_items table
ALTER TABLE content_items
ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT,
ADD COLUMN IF NOT EXISTS cloudinary_url TEXT;

-- Add Cloudinary-specific columns to library_items table
ALTER TABLE library_items
ADD COLUMN IF NOT EXISTS cloudinary_data JSONB;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_items_cloudinary_public_id ON content_items(cloudinary_public_id);
CREATE INDEX IF NOT EXISTS idx_content_items_cloudinary_url ON content_items(cloudinary_url);
