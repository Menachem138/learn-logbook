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
 * @throws {Error} When API key is not configured or invalid
 * @throws {Error} When video is not found
 */
export async function getYouTubeVideoDetails(videoId: string) {
  console.log('Checking YouTube API key configuration...');
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('YouTube API key is not configured in the environment');
    throw new Error('API key not configured');
  }

  console.log('Fetching video details for ID:', videoId);
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`
  );
  const data = await response.json();

  if (!response.ok) {
    console.error('YouTube API error:', data);
    throw new Error('API key is invalid or request failed');
  }

  if (!data.items?.[0]) {
    console.error('Video not found:', videoId);
    throw new Error('Video not found');
  }

  return {
    title: data.items[0].snippet.title,
    thumbnail: data.items[0].snippet.thumbnails.high.url,
  };
}

/**
 * Validates a YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return !!parseYouTubeUrl(url);
}
