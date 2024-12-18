-- Enable RLS
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Add migration policy for content_items
CREATE POLICY "migration_policy" ON content_items
  FOR ALL
  USING (true)
  WITH CHECK (true);
