import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
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
      <DialogContent className={cn("sm:max-w-[800px] w-full p-6", className)}>
        <DialogTitle className="text-right mb-4">
          צפייה בסרטון
        </DialogTitle>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        )}
        <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
