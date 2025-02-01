import { useYouTubeStore } from '../youtube';
import { supabase } from '../../integrations/supabase/client';
import { parseYouTubeUrl, getYouTubeVideoDetails } from '../../utils/youtube';

jest.mock('../../integrations/supabase/client', () => {
  const createMockChainMethod = () => {
    const fn = jest.fn();
    fn.mockReturnValue(fn);
    return fn;
  };

  const mockChain = {
    data: null as any,
    error: null as any,
    select: createMockChainMethod(),
    insert: createMockChainMethod(),
    delete: createMockChainMethod(),
    order: createMockChainMethod(),
    eq: createMockChainMethod(),
    then: function(resolve: any) {
      return Promise.resolve(resolve({ data: this.data, error: this.error }));
    },
  };

  // Setup the chain returns
  mockChain.select.mockReturnValue(mockChain);
  mockChain.delete.mockReturnValue(mockChain);
  mockChain.order.mockReturnValue(mockChain);
  mockChain.eq.mockReturnValue(mockChain);
  mockChain.insert.mockReturnValue(mockChain);

  return {
    supabase: {
      from: jest.fn().mockReturnValue(mockChain),
      mockChain, // Expose for test manipulation
    },
  };
});

jest.mock('../../utils/youtube', () => ({
  parseYouTubeUrl: jest.fn(),
  getYouTubeVideoDetails: jest.fn(),
}));

describe('YouTubeStore', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    useYouTubeStore.setState({ videos: [], isLoading: false, error: null });
    mockSupabase = (supabase as any);
    mockSupabase.mockChain.data = null;
    mockSupabase.mockChain.error = null;
  });

  describe('fetchVideos', () => {
    it('should fetch videos successfully', async () => {
      const mockVideos = [{
        id: '1',
        title: 'Test Video',
        url: 'https://youtu.be/123',
        video_id: '123',
        thumbnail_url: 'https://example.com/thumb.jpg',
        created_at: new Date().toISOString(),
        user_id: null,
      }];

      // Set up mock data before calling fetchVideos
      mockSupabase.mockChain.data = mockVideos;
      mockSupabase.mockChain.error = null;

      const store = useYouTubeStore.getState();
      await store.fetchVideos();

      // Wait for next tick to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 0));

      // Get fresh state after update
      const updatedState = useYouTubeStore.getState();

      expect(mockSupabase.from).toHaveBeenCalledWith('youtube_videos');
      expect(mockSupabase.mockChain.select).toHaveBeenCalled();
      expect(mockSupabase.mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(updatedState.videos).toEqual(mockVideos);
      expect(updatedState.isLoading).toBe(false);
      expect(updatedState.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      const mockError = { message: 'Failed to fetch' };
      mockSupabase.mockChain.data = null;
      mockSupabase.mockChain.error = mockError;

      const store = useYouTubeStore.getState();
      await store.fetchVideos();

      // Wait for next tick to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 0));

      // Get fresh state after update
      const updatedState = useYouTubeStore.getState();

      expect(updatedState.videos).toEqual([]);
      expect(updatedState.isLoading).toBe(false);
      expect(updatedState.error).toBe(mockError.message);
    });
  });

  describe('addVideo', () => {
    it('should add video successfully', async () => {
      const url = 'https://youtu.be/123';
      const videoId = '123';
      const videoDetails = {
        title: 'Test Video',
        thumbnail: 'https://example.com/thumb.jpg',
      };

      (parseYouTubeUrl as jest.Mock).mockReturnValue(videoId);
      (getYouTubeVideoDetails as jest.Mock).mockResolvedValue(videoDetails);

      const store = useYouTubeStore.getState();
      await store.addVideo(url);

      expect(parseYouTubeUrl).toHaveBeenCalledWith(url);
      expect(getYouTubeVideoDetails).toHaveBeenCalledWith(videoId);
      expect(mockSupabase.from).toHaveBeenCalledWith('youtube_videos');
      expect(mockSupabase.mockChain.insert).toHaveBeenCalledWith({
        url,
        video_id: videoId,
        title: videoDetails.title,
        thumbnail_url: videoDetails.thumbnail,
      });
    });

    it('should handle invalid URL', async () => {
      (parseYouTubeUrl as jest.Mock).mockReturnValue(null);

      const store = useYouTubeStore.getState();
      await expect(store.addVideo('invalid-url')).rejects.toThrow('Invalid YouTube URL');
    });
  });

  describe('deleteVideo', () => {
    it('should delete video successfully', async () => {
      const videoId = '123';

      const store = useYouTubeStore.getState();
      await store.deleteVideo(videoId);

      expect(mockSupabase.from).toHaveBeenCalledWith('youtube_videos');
      expect(mockSupabase.mockChain.delete).toHaveBeenCalled();
      expect(mockSupabase.mockChain.eq).toHaveBeenCalledWith('id', videoId);
    });
  });
});
