-- Add url column to library_items table
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS url TEXT;

-- Add index on url column for better query performance
CREATE INDEX IF NOT EXISTS idx_library_items_url ON library_items(url);

-- Add constraint to ensure url is required for youtube type items
ALTER TABLE library_items ADD CONSTRAINT chk_youtube_url
  CHECK (
    (type = 'youtube' AND url IS NOT NULL) OR
    (type != 'youtube')
  );
