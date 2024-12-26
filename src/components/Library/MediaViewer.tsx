import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "image" | "video";
  src: string;
  title: string;
}

export function MediaViewer({ isOpen, onClose, type, src, title }: MediaViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10 bg-black/20 hover:bg-black/40"
            onClick={onClose}
          >
            <X className="h-4 w-4 text-white" />
          </Button>
          {type === "image" ? (
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
              autoPlay
            >
              <source src={src} type="video/mp4" />
              הדפדפן שלך לא תומך בתגית וידאו.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}