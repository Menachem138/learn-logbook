import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface YouTubePlayerProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function YouTubePlayer({ videoId, isOpen, onClose }: YouTubePlayerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <div className="aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
