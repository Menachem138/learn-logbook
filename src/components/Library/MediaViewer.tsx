import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "image" | "video";
  src: string | string[];
  title: string;
}

export function MediaViewer({ isOpen, onClose, type, src, title }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = Array.isArray(src) ? src : [src];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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
          
          {type === "image" && (
            <div className="relative">
              <img
                src={images[currentIndex]}
                alt={`${title} - תמונה ${currentIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={handlePrevious}
                  >
                    ←
                  </Button>
                  <Button
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={handleNext}
                  >
                    →
                  </Button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white bg-black/40 px-2 py-1 rounded">
                    {currentIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          )}

          {type === "video" && (
            <video
              src={images[0]}
              controls
              className="w-full max-h-[80vh]"
              autoPlay
            >
              <source src={images[0]} type="video/mp4" />
              הדפדפן שלך לא תומך בתגית וידאו.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}