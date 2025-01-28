import React from "react";
import { Dialog, DialogContent, DialogDescription } from "../ui/dialog";

interface YouTubePlayerProps {
  videoId: string;
  onClose: () => void;
}

export function YouTubePlayer({ videoId, onClose }: YouTubePlayerProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0">
        <DialogDescription className="sr-only">
          YouTube video player
        </DialogDescription>
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
