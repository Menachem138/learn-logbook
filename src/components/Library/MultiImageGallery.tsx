import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface MultiImageGalleryProps {
  images: string[];
}

export function MultiImageGallery({ images }: MultiImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Show up to four images in preview
  const previewImages = images.slice(0, 4);
  const extraCount = images.length > 4 ? images.length - 4 : 0;

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "Escape") setIsOpen(false);
  };

  return (
    <div className="space-y-2" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="grid grid-cols-2 gap-1">
        {previewImages.map((imgUrl, idx) => (
          <div
            key={idx}
            className="relative aspect-square overflow-hidden cursor-pointer"
            onClick={() => {
              setCurrentImageIndex(idx);
              setIsOpen(true);
            }}
          >
            <img
              src={imgUrl}
              alt={`Gallery image ${idx + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
            {idx === 3 && extraCount > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-semibold">
                +{extraCount}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <DialogContent className="max-w-4xl w-full p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-black/20 hover:bg-black/40"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4 text-white" />
            </Button>
            
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4 text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4 text-white" />
                </Button>
              </>
            )}

            <img
              src={images[currentImageIndex]}
              alt={`Gallery image ${currentImageIndex + 1} of ${images.length}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
