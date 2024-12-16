import { createClient } from '@supabase/supabase-js';

/**
 * Parses a YouTube URL to extract the video ID
 * Supports both formats:
 * - https://www.youtube.com/watch?v=XXXXXXXXXXX
 * - https://youtu.be/XXXXXXXXXXX
 */
export function parseYouTubeUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu.be\/)([^&\n?#]+)/,
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
  console.log('Checking YouTube API key configuration...');
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('YouTube API key is not configured in the environment');
    throw new Error('API key not configured');
  }

  console.log('Using API key:', apiKey.substring(0, 8) + '...');
  console.log('Fetching video details for ID:', videoId);

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`
    );

    const data = await response.json();
    console.log('YouTube API response:', {
      status: response.status,
      ok: response.ok,
      error: data.error,
      items: data.items?.length
    });

    if (!response.ok) {
      console.error('YouTube API error:', data);
      throw new Error(`YouTube API error: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.items?.[0]) {
      console.error('Video not found:', videoId);
      throw new Error('Video not found');
    }

    const videoDetails = {
      title: data.items[0].snippet.title,
      thumbnail: data.items[0].snippet.thumbnails.high.url,
    };
    console.log('Successfully fetched video details:', videoDetails);
    return videoDetails;
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
}

/**
 * Validates a YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return !!parseYouTubeUrl(url);
}
