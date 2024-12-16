import { createClient } from '@supabase/supabase-js';

/**
 * Parses a YouTube URL to extract the video ID
 * Supports multiple formats:
 * - https://www.youtube.com/watch?v=XXXXXXXXXXX
 * - https://youtu.be/XXXXXXXXXXX
 * - https://youtube.com/shorts/XXXXXXXXXXX
 * - https://www.youtube.com/embed/XXXXXXXXXXX
 */
export function parseYouTubeUrl(url: string): string | null {
  if (!url) {
    console.error('Empty URL provided to parseYouTubeUrl');
    return null;
  }

  console.log('Parsing YouTube URL:', url);

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu.be\/|youtube.com\/shorts\/|youtube.com\/embed\/)([^&\n?#]+)/,
    /^[a-zA-Z0-9_-]{11}$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      console.log('Successfully extracted video ID:', match[1]);
      return match[1];
    }
  }

  console.error('Failed to extract video ID from URL:', url);
  return null;
}

/**
 * Gets the YouTube video thumbnail URL with quality fallbacks
 * Handles both direct video IDs and stored video data from Supabase
 */
export function getYouTubeThumbnail(url: string): string {
  // Try to extract video ID from URL first
  const videoId = parseYouTubeUrl(url);
  if (!videoId) {
    console.error('Invalid YouTube URL or ID:', url);
    return '';
  }

  console.log('Generating thumbnail URL for video ID:', videoId);

  // Try multiple thumbnail qualities in order of preference
  const qualities = ['maxresdefault', 'hqdefault', 'mqdefault', 'default'];

  // Return the highest quality thumbnail URL
  // We'll validate the actual availability client-side with onerror handlers
  return `https://img.youtube.com/vi/${videoId}/${qualities[0]}.jpg`;
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
