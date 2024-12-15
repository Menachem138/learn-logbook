import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getYouTubeVideoId } from "@/utils/youtube";

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "image" | "video" | "youtube";
  src: string;
  title: string;
}

export function MediaViewer({ isOpen, onClose, type, src, title }: MediaViewerProps) {
  console.log('MediaViewer props:', { isOpen, type, src, title });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 h-auto overflow-visible">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="relative w-full h-full bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          {type === "youtube" ? (
            <div className="w-full aspect-video relative">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(src)}?autoplay=1`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0"
                style={{ border: 'none' }}
              />
            </div>
          ) : type === "image" ? (
            <img
              src={src}
              alt={title}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          ) : (
            <video
              src={src}
              controls
              className="w-full max-h-[80vh]"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
