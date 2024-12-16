import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../integrations/supabase/client';
import { parseYouTubeUrl, getYouTubeVideoDetails } from '../utils/youtube';
import type { Database } from '../integrations/supabase/types';

type YouTubeVideo = Database['public']['Tables']['youtube_videos']['Row'];

interface YouTubeStore {
  videos: YouTubeVideo[];
  isLoading: boolean;
  error: string | null;
  fetchVideos: () => Promise<void>;
  addVideo: (url: string) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
}

const getHebrewError = (error: string): string => {
  if (error.includes('API key')) {
    return 'מפתח ה-API של YouTube לא מוגדר או לא תקין';
  }
  if (error.includes('Invalid YouTube URL')) {
    return 'כתובת URL לא חוקית של YouTube';
  }
  if (error.includes('Failed to fetch')) {
    return 'שגיאה בטעינת הסרטונים';
  }
  if (error.includes('Failed to add')) {
    return 'שגיאה בהוספת הסרטון - אנא נסה שנית';
  }
  if (error.includes('Failed to delete')) {
    return 'שגיאה במחיקת הסרטון';
  }
  if (error.includes('Unauthorized')) {
    return 'נא להתחבר כדי לצפות בסרטונים';
  }
  return 'שגיאה לא צפויה - אנא נסה שנית';
};

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
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          console.log('Supabase response:', { data, error });

          if (error) {
            console.error('Error fetching videos:', error);
            throw error;
          }

          set({ videos: data || [], isLoading: false, error: null });
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
              user_id: user.id
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

          const { error } = await supabase
            .from('youtube_videos')
            .delete()
            .eq('id', id);

          if (error) {
            const hebrewError = getHebrewError('Failed to delete video');
            set({ error: hebrewError, isLoading: false });
            throw error;
          }

          const store = useYouTubeStore.getState();
          await store.fetchVideos();
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
          try {
            localStorage.setItem(name, JSON.stringify(value));
            console.log('Successfully saved to storage');
          } catch (error) {
            console.error('Error saving to storage:', error);
          }
        },
        removeItem: (name) => {
          console.log('Removing item from storage:', name);
          localStorage.removeItem(name);
        },
      },
      partialize: (state: YouTubeStore) => {
        console.log('Partializing state:', state);
        const partialState = {
          videos: state.videos,
          isLoading: false,
          error: null
        };
        console.log('Partial state:', partialState);
        return partialState;
      },
      version: 1,
      onRehydrateStorage: () => {
        console.log('Starting rehydration...');
        return async (state) => {
          console.log('Rehydrating store with state:', state);

          try {
            // Wait for auth state to be fully established
            console.log('Waiting for auth state to stabilize...');
            await new Promise(resolve => setTimeout(resolve, 500));

            const { data: { user }, error: authError } = await supabase.auth.getUser();
            console.log('Auth state during rehydration:', { user, authError });

            if (authError) {
              console.error('Auth error during rehydration:', authError);
              useYouTubeStore.setState({
                videos: [],
                error: getHebrewError('Unauthorized'),
                isLoading: false
              });
              return;
            }

            if (user) {
              console.log('User authenticated during rehydration, fetching fresh data...');
              // Set existing videos first if available
              if (state?.videos?.length) {
                console.log('Setting existing videos from state:', state.videos);
                useYouTubeStore.setState({
                  videos: state.videos,
                  isLoading: true,
                  error: null
                });
              }

              // Fetch fresh videos after a delay to ensure auth is ready
              console.log('Waiting before fetching fresh videos...');
              await new Promise(resolve => setTimeout(resolve, 500));
              const store = useYouTubeStore.getState();
              await store.fetchVideos();
            } else {
              console.log('No authenticated user during rehydration');
              useYouTubeStore.setState({
                videos: [],
                error: getHebrewError('Unauthorized'),
                isLoading: false
              });
            }
          } catch (error) {
            console.error('Error during rehydration:', error);
            useYouTubeStore.setState({
              error: getHebrewError('Failed to fetch'),
              isLoading: false
            });
          }
        };
      },
    }
  )
);
