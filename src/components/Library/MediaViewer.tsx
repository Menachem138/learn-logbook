import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getYouTubeVideoId } from '@/utils/youtube';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function MediaViewer({ isOpen, onClose, url, title }: MediaViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !url) return;

    const loadYouTubeAPI = () => {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    };

    if (!(window as any).YT) {
      loadYouTubeAPI();
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      if (!iframeRef.current) return;

      const videoId = getYouTubeVideoId(url);
      if (!videoId) {
        setError('Invalid YouTube URL');
        setIsLoading(false);
        return;
      }

      try {
        playerRef.current = new (window as any).YT.Player(iframeRef.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin
          },
          events: {
            onReady: () => setIsLoading(false),
            onError: () => {
              setError('Failed to load video');
              setIsLoading(false);
            }
          }
        });
      } catch (err) {
        setError('Failed to initialize video player');
        setIsLoading(false);
      }
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isOpen, url]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] h-[600px] p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          {error ? (
            <div className="text-center p-4">
              <p className="text-red-500 mb-2">{error}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Watch on YouTube
              </a>
            </div>
          ) : (
            <div ref={iframeRef} className="w-full h-full" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
