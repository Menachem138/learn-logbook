import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "image" | "video" | "gallery";
  src: string | string[];
  title: string;
}

export function MediaViewer({ isOpen, onClose, type, src, title }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = Array.isArray(src) ? src : [src];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      handlePrevious();
    } else if (event.key === "ArrowRight") {
      handleNext();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl w-full h-[80vh] flex flex-col p-0"
        onKeyDown={handleKeyDown}
      >
        <div className="relative flex-1 bg-black flex items-center justify-center">
          {type === "video" ? (
            <video 
              controls 
              className="max-h-full max-w-full"
              src={typeof src === 'string' ? src : src[currentIndex]}
            >
              הדפדפן שלך לא תומך בתגית וידאו.
            </video>
          ) : (
            <img
              src={images[currentIndex]}
              alt={title}
              className="max-h-full max-w-full object-contain"
            />
          )}
          
          {(type === "image" || type === "gallery") && images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {(type === "image" || type === "gallery") && images.length > 1 && (
          <div className="p-2 bg-white dark:bg-gray-950 flex justify-center items-center gap-2">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}