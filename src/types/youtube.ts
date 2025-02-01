export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  video_id: string;
  user_id?: string;
  created_at?: string;
}

export interface YouTubeStore {
  videos: YouTubeVideo[];
  isLoading: boolean;
  error: string | null;
  fetchVideos: () => Promise<void>;
  addVideo: (url: string) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
}