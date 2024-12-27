import { create } from 'zustand';
import { supabase } from '../integrations/supabase/client';
import { parseYouTubeUrl, getYouTubeVideoDetails } from '../utils/youtube';
import { getHebrewError } from '../utils/youtubeErrors';
import type { YouTubeStore, YouTubeVideo } from '../types/youtube';

export const useYouTubeStore = create<YouTubeStore>()((set, get) => ({
  videos: [],
  isLoading: false,
  error: null,

  fetchVideos: async () => {
    console.log('YouTubeStore: Starting to fetch videos...');
    set({ isLoading: true, error: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('YouTubeStore: Fetching videos for user:', user.id);
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('YouTubeStore: Error fetching videos:', error);
        throw error;
      }

      console.log('YouTubeStore: Successfully fetched videos:', data?.length);
      set({ videos: data || [], isLoading: false, error: null });
    } catch (error) {
      console.error('YouTubeStore: Error in fetchVideos:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch videos';
      set({ error: getHebrewError(message), isLoading: false });
      throw error;
    }
  },

  addVideo: async (url: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
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
          user_id: user.id
        });

      if (error) throw error;

      await get().fetchVideos();
      set({ isLoading: false, error: null });
    } catch (error) {
      console.error('Error adding video:', error);
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
        throw new Error('User not authenticated');
      }

      console.log('Attempting to delete video:', { videoId: id });

      const { error } = await supabase
        .from('youtube_videos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Delete video - Database error:', error);
        throw error;
      }

      set(state => ({
        videos: state.videos.filter(video => video.id !== id),
        isLoading: false,
        error: null
      }));
      
      console.log('Delete video - Success, UI updated');
    } catch (error) {
      console.error('Error deleting video:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete video';
      set({ error: getHebrewError(message), isLoading: false });
      throw error;
    }
  },
}));