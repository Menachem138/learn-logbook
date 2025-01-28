import { parseYouTubeUrl, isValidYouTubeUrl, getYouTubeVideoDetails } from '../youtube';

// Mock fetch for YouTube API calls
global.fetch = jest.fn();

describe('YouTube Utils', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('parseYouTubeUrl', () => {
    it('should parse youtube.com watch URLs', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(parseYouTubeUrl(url)).toBe('dQw4w9WgXcQ');
    });

    it('should parse youtu.be URLs', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      expect(parseYouTubeUrl(url)).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URLs', () => {
      const url = 'https://example.com';
      expect(parseYouTubeUrl(url)).toBeNull();
    });
  });

  describe('isValidYouTubeUrl', () => {
    it('should return true for valid youtube.com URLs', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(isValidYouTubeUrl(url)).toBe(true);
    });

    it('should return true for valid youtu.be URLs', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      expect(isValidYouTubeUrl(url)).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      const url = 'https://example.com';
      expect(isValidYouTubeUrl(url)).toBe(false);
    });
  });

  describe('getYouTubeVideoDetails', () => {
    it('should fetch video details successfully', async () => {
      const mockResponse = {
        items: [{
          snippet: {
            title: 'Test Video',
            thumbnails: {
              high: {
                url: 'https://example.com/thumbnail.jpg'
              }
            }
          }
        }]
      };

      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockResponse)
        })
      );

      const result = await getYouTubeVideoDetails('dQw4w9WgXcQ');
      expect(result).toEqual({
        title: 'Test Video',
        thumbnail: 'https://example.com/thumbnail.jpg'
      });
    });

    it('should throw error when video is not found', async () => {
      const mockResponse = { items: [] };

      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockResponse)
        })
      );

      await expect(getYouTubeVideoDetails('invalid-id')).rejects.toThrow('Video not found');
    });
  });
});
