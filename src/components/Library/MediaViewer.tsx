import { useEffect, useState } from 'react';
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
  const videoId = url ? getYouTubeVideoId(url) : null;

  useEffect(() => {
    if (!isOpen || !videoId) {
      setError(videoId ? null : 'Invalid YouTube URL');
      setIsLoading(false);
      return;
    }

    // Reset states when opening modal
    setIsLoading(true);
    setError(null);

    // Simulate loading delay for iframe
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, videoId]);

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
            !isLoading && videoId && (
              <div className="w-full h-full flex flex-col">
                <iframe
                  title={title}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="flex-grow"
                />
                <div className="p-2 flex justify-center">
                  <Button variant="secondary" asChild>
                    <a
                      href={`https://www.youtube.com/watch?v=${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm"
                    >
                      Watch on YouTube
                    </a>
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
