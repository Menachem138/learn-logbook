-- Create base tables if they don't exist
CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    content_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER
);

CREATE TABLE IF NOT EXISTS library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_items_user_id ON content_items(user_id);
CREATE INDEX IF NOT EXISTS idx_library_items_user_id ON library_items(user_id);

-- Enable Row Level Security
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own content"
    ON content_items
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content"
    ON content_items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content"
    ON content_items
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
    ON content_items
    FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own library items"
    ON library_items
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own library items"
    ON library_items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own library items"
    ON library_items
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own library items"
    ON library_items
    FOR DELETE
    USING (auth.uid() = user_id);
