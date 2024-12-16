import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription } from "../ui/dialog";
import { cn } from "@/lib/utils";

interface YouTubePlayerProps {
  videoId: string;
  onClose: () => void;
  className?: string;
}

export function YouTubePlayer({ videoId, onClose, className }: YouTubePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className={cn("max-w-4xl w-full p-0", className)}>
        <DialogDescription className="sr-only">
          נגן סרטון YouTube
        </DialogDescription>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            loading="lazy"
            title="YouTube video player"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
