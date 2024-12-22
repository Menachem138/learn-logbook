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

  // Show up to four images in preview, ensuring last image is in bottom-right
  const previewImages = images.slice(0, 4);
  const extraCount = images.length > 4 ? images.length - 4 : 0;
  
  // Reorder preview images to ensure last image is bottom-right
  const orderedPreviewImages = previewImages.slice(0, -1);
  if (previewImages.length === 4) {
    orderedPreviewImages.push(previewImages[2]);
    orderedPreviewImages.push(previewImages[3]);
  } else {
    orderedPreviewImages.push(...previewImages.slice(-1));
  }

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
    <div className="space-y-4" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="grid grid-cols-2 gap-2 p-2 bg-white rounded-lg shadow-sm">
        {orderedPreviewImages.map((imgUrl, idx) => (
          <div
            key={idx}
            className="relative aspect-square overflow-hidden cursor-pointer rounded-md group"
            onClick={() => {
              setCurrentImageIndex(idx);
              setIsOpen(true);
            }}
          >
            <img
              src={imgUrl}
              alt={`Gallery image ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            {idx === 3 && extraCount > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-medium">
                +{extraCount}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <DialogContent className="max-w-5xl w-full p-0 bg-black/95">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10 bg-black/40 hover:bg-black/60"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5 text-white" />
            </Button>
            
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 h-12 w-12"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 h-12 w-12"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </Button>
              </>
            )}

            <img
              src={images[currentImageIndex]}
              alt={`Gallery image ${currentImageIndex + 1} of ${images.length}`}
              className="w-full h-auto max-h-[85vh] object-contain mx-auto py-8"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
