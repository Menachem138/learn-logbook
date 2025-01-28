import { supabase } from "@/integrations/supabase/client";

/**
 * Parses a YouTube URL to extract the video ID
 * Supports both formats:
 * - https://www.youtube.com/watch?v=XXXXXXXXXXX
 * - https://youtu.be/XXXXXXXXXXX
 */
export function parseYouTubeUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/\?v=)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

/**
 * Fetches video details from YouTube API
 */
export async function getYouTubeVideoDetails(videoId: string) {
  const { data, error } = await supabase.functions.invoke('get-youtube-video-details', {
    body: { videoId }
  });

  if (error) {
    console.error('Error fetching video details:', error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Video not found');
  }

  return {
    title: data.title,
    thumbnail: data.thumbnail,
  };
}

/**
 * Validates a YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return !!parseYouTubeUrl(url);
}