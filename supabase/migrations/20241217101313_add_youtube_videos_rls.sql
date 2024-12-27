-- Enable RLS
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own videos
CREATE POLICY "Users can view their own videos"
  ON public.youtube_videos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own videos
CREATE POLICY "Users can insert their own videos"
  ON public.youtube_videos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos"
  ON public.youtube_videos
  FOR DELETE
  USING (auth.uid() = user_id);
