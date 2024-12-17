import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../integrations/supabase/client';
import { parseYouTubeUrl, getYouTubeVideoDetails } from '../utils/youtube';
import { getHebrewError } from '../utils/youtubeErrors';
import type { YouTubeStore, YouTubeVideo } from '../types/youtube';

export const useYouTubeStore = create<YouTubeStore>()(
  persist(
    (set, get) => ({
      videos: [],
      isLoading: false,
      error: null,

      fetchVideos: async () => {
        console.log('Fetching videos from Supabase...');
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          console.log('Fetch videos - Auth state:', { isAuthenticated: !!user, userId: user?.id });

          if (!user) {
            console.log('No authenticated user, cannot fetch videos');
            throw new Error('Unauthorized');
          }

          const { data, error } = await supabase
            .from('youtube_videos')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching videos:', error);
            throw error;
          }

          set({ videos: data || [], isLoading: false, error: null });
          console.log('Videos updated in store:', data);
        } catch (error) {
          console.error('Error in fetchVideos:', error);
          const message = error instanceof Error ? error.message : 'Failed to fetch videos';
          set({ error: getHebrewError(message), isLoading: false });
        }
      },

      addVideo: async (url: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Unauthorized');
          }

          const videoId = parseYouTubeUrl(url);
          if (!videoId) {
            throw new Error('Invalid YouTube URL');
          }

          const details = await getYouTubeVideoDetails(videoId);
          const { error } = await supabase
            .from('youtube_videos')
            .insert({
              url,
              video_id: videoId,
              title: details.title,
              thumbnail_url: details.thumbnail,
              user_id: user.id,
            });

          if (error) throw error;

          await get().fetchVideos();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add video';
          set({ error: getHebrewError(message), isLoading: false });
          throw error;
        }
      },

      deleteVideo: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Unauthorized');
          }

          const { error } = await supabase
            .from('youtube_videos')
            .delete()
            .eq('id', id);

          if (error) throw error;

          await get().fetchVideos();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete video';
          set({ error: getHebrewError(message), isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'youtube-videos',
      partialize: (state) => ({ videos: state.videos }),
    }
  )
);