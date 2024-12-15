import { z } from 'zod';

const youtubeUrlSchema = z.string().refine((url) => {
  const pattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
  return pattern.test(url);
}, 'Invalid YouTube URL');

export function getYouTubeVideoId(url: string): string | null {
  try {
    const validUrl = youtubeUrlSchema.parse(url);
    const match = validUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:\?|&|$)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}
