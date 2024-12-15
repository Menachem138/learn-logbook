/**
 * Utility functions for handling YouTube video URLs and thumbnails
 */

/**
 * Extracts the video ID from a YouTube URL
 * Supports various YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
export function getYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Generates the thumbnail URL for a YouTube video
 * Uses the default thumbnail (0.jpg) which is always available
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/0.jpg`;
}

/**
 * Validates if a string is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return !!getYouTubeVideoId(url);
}

/**
 * Fetches metadata for a YouTube video using the noembed.com API
 * @param videoId The YouTube video ID
 * @returns Object containing video title, author, and thumbnail URL, or null if fetch fails
 */
export async function fetchYouTubeMetadata(videoId: string) {
  try {
    const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }
    const data = await response.json();
    return {
      title: data.title || '',
      author: data.author_name || '',
      thumbnail: data.thumbnail_url || getYouTubeThumbnail(videoId)
    };
  } catch (error) {
    console.error('Failed to fetch YouTube metadata:', error);
    return {
      title: '',
      author: '',
      thumbnail: getYouTubeThumbnail(videoId)
    };
  }
}
