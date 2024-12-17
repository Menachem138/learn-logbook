import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../integrations/supabase/client';
import { parseYouTubeUrl, getYouTubeVideoDetails } from '../utils/youtube';
import type { Database } from '../integrations/supabase/types';

export type YouTubeVideo = Database['public']['Tables']['youtube_videos']['Row'];

interface YouTubeStore {
  videos: YouTubeVideo[];
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  fetchVideos: () => Promise<void>;
  addVideo: (url: string) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
}

const getHebrewError = (error: string): string => {
  if (error.includes('API key')) {
    return 'מפתח ה-API של YouTube לא מוגדר';
  }
  if (error.includes('Invalid YouTube URL')) {
    return 'פורמט כתובת URL לא חוקי של YouTube';
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
  if (error.includes('Unauthorized')) {
    return 'נא להתחבר כדי לצפות בסרטונים';
  }
  return 'שגיאה לא צפויה';
};

export const useYouTubeStore = create<YouTubeStore>()(
  persist(
    (set, get) => ({
      videos: [],
      isLoading: false,
      error: null,
      initialized: false,

      fetchVideos: async () => {
        if (get().isLoading) return;
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

          console.log('Supabase response:', { data, error });

          if (error) {
            console.error('Error fetching videos:', error);
            throw error;
          }

          set({ videos: data || [], isLoading: false, error: null, initialized: true });
          console.log('Videos updated in store:', data);
        } catch (error) {
          console.error('Error in fetchVideos:', error);
          set({ error: getHebrewError(error.message), isLoading: false });
        }
      },

      addVideo: async (url: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            const hebrewError = getHebrewError('Unauthorized');
            set({ error: hebrewError, isLoading: false });
            return;
          }

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

          const store = useYouTubeStore.getState();
          await store.fetchVideos();
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
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            const hebrewError = getHebrewError('Unauthorized');
            set({ error: hebrewError, isLoading: false });
            return;
          }

          // Update local state immediately for better UX
          const currentVideos = get().videos;
          set({
            videos: currentVideos.filter(v => v.id !== id),
            isLoading: true
          });

          const { error } = await supabase
            .from('youtube_videos')
            .delete()
            .eq('id', id);

          if (error) {
            // Revert local state if deletion failed
            set({
              videos: currentVideos,
              error: getHebrewError('Failed to delete video'),
              isLoading: false
            });
            throw error;
          }

          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete video';
          const hebrewError = getHebrewError(errorMessage);
          set({ error: hebrewError, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'youtube-videos',
      storage: {
        getItem: (name) => {
          console.log('Getting item from storage:', name);
          const str = localStorage.getItem(name);
          if (!str) {
            console.log('No data found in storage');
            return null;
          }
          try {
            const data = JSON.parse(str);
            console.log('Retrieved from storage:', data);
            return data;
          } catch (error) {
            console.error('Error parsing storage:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          console.log('Saving to storage:', { name, value });
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (state: YouTubeStore) => {
        console.log('Partializing state:', state);
        return {
          videos: state.videos,
          isLoading: state.isLoading,
          error: state.error,
          initialized: state.initialized
        };
      },
      version: 1,
      onRehydrateStorage: () => {
        console.log('Starting rehydration...');
        return async (state) => {
          console.log('Rehydrating store with state:', state);

          // Don't reset videos immediately, keep the persisted state during rehydration
          useYouTubeStore.setState({
            isLoading: true,
            error: null,
            initialized: false,
            // Keep existing videos from persisted state
            videos: state?.videos || []
          });

          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              console.log('User authenticated during rehydration, fetching fresh data...');
              const store = useYouTubeStore.getState();
              await store.fetchVideos();
            } else {
              console.log('No authenticated user during rehydration');
              set({ isLoading: false });
            }
          } catch (error) {
            console.error('Error during rehydration:', error);
            set({ isLoading: false, error: getHebrewError(error.message) });
          }
        };
      },
      skipHydration: true
    }
  )
);
