import { create } from 'zustand';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { parseYouTubeUrl, getYouTubeVideoDetails } from '../utils/youtube';
import type { Database } from '../integrations/supabase/types';

type YouTubeVideo = Database['public']['Tables']['youtube_videos']['Row'];

interface YouTubeStore {
  videos: YouTubeVideo[];
  isLoading: boolean;
  error: string | null;
  subscription: RealtimeChannel | null;
  initializeSubscription: () => void;
  cleanup: () => void;
  addVideo: (url: string) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  fetchVideos: () => Promise<void>;
}

const getHebrewError = (error: string): string => {
  if (error.includes('API key')) {
    return 'מפתח ה-API של YouTube לא מוגדר';
  }
  if (error.includes('Invalid YouTube URL')) {
    return 'כתובת URL לא חוקית של YouTube';
  }
  if (error.includes('Failed to fetch')) {
    return 'שגיאה בטעינת הסרטונים';
  }
  if (error.includes('Failed to add')) {
    return 'שגיאה בהוספת הסרטון';
  }
  if (error.includes('Failed to delete')) {
    return 'שגיאה במחיקת הסרטון';
  }
  if (error.includes('Failed to initialize subscription')) {
    return 'שגיאה בהתחברות למערכת העדכונים בזמן אמת';
  }
  return 'שגיאה לא צפויה';
};

export const useYouTubeStore = create<YouTubeStore>((set, get) => ({
  videos: [],
  isLoading: false,
  error: null,
  subscription: null,

  initializeSubscription: () => {
    try {
      console.log('Initializing YouTube videos subscription');
      const subscription = supabase
        .channel('youtube_videos_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'youtube_videos'
          },
          async (payload) => {
            console.log('Received subscription update:', payload);
            await get().fetchVideos();
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            get().fetchVideos();
          }
        });

      set({ subscription });
    } catch (error) {
      console.error('Failed to initialize subscription:', error);
      set({ error: getHebrewError('Failed to initialize subscription') });
    }
  },

  cleanup: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null });
    }
  },

  fetchVideos: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        const hebrewError = getHebrewError('Failed to fetch videos');
        set({ error: hebrewError, isLoading: false, videos: [] });
        return;
      }

      set({ videos: data || [], isLoading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch videos';
      const hebrewError = getHebrewError(errorMessage);
      set({ error: hebrewError, isLoading: false, videos: [] });
    }
  },

  addVideo: async (url: string) => {
    set({ isLoading: true, error: null });
    try {
      if (!import.meta.env.VITE_YOUTUBE_API_KEY) {
        throw new Error('YouTube API key is not configured');
      }

      const videoId = parseYouTubeUrl(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL format');
      }

      const details = await getYouTubeVideoDetails(videoId);
      const { error } = await supabase
        .from('youtube_videos')
        .insert({
          url,
          video_id: videoId,
          title: details.title,
          thumbnail_url: details.thumbnail,
        });

      if (error) {
        const hebrewError = getHebrewError('Failed to add video');
        set({ error: hebrewError, isLoading: false });
        throw error;
      }

      await get().fetchVideos();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add video';
      const hebrewError = getHebrewError(errorMessage);
      set({ error: hebrewError, isLoading: false });
      throw error;
    }
  },

  deleteVideo: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('youtube_videos')
        .delete()
        .eq('id', id);

      if (error) {
        const hebrewError = getHebrewError('Failed to delete video');
        set({ error: hebrewError, isLoading: false });
        throw error;
      }

      await get().fetchVideos();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete video';
      const hebrewError = getHebrewError(errorMessage);
      set({ error: hebrewError, isLoading: false });
      throw error;
    }
  },
}));
