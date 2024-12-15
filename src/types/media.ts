interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  user_id: string;
  created_at: string;
}

interface JournalImage {
  id: string;
  url: string;
  filename: string;
  user_id: string;
  journal_entry_id: string;
  created_at: string;
}

export type { YouTubeVideo, JournalImage };
