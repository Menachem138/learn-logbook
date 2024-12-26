import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageAlbumCardProps {
  images: string[];
  title: string;
  onEdit?: () => void;
}

export function ImageAlbumCard({ images, title, onEdit }: ImageAlbumCardProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  console.log("ImageAlbumCard - Received images:", images);
  
  // Ensure images is always an array
  const imageUrls = Array.isArray(images) ? images : 
    typeof images === 'string' ? [images] : [];
  
  console.log("ImageAlbumCard - Processed imageUrls:", imageUrls);
  
  const displayedImages = imageUrls.slice(0, 4);
  const extraCount = Math.max(0, imageUrls.length - 4);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  if (!imageUrls || imageUrls.length === 0) {
    console.log("No images to display");
    return null;
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-2 gap-2 p-2">
          {displayedImages.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-square cursor-pointer overflow-hidden rounded-md"
              onClick={() => handleImageClick(idx)}
            >
              <img
                src={url}
                alt={`${title} - תמונה ${idx + 1}`}
                className="h-full w-full object-cover transition-transform hover:scale-105"
                onError={(e) => {
                  console.error("Error loading image:", url);
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              {idx === 3 && extraCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-2xl font-bold text-white">
                  +{extraCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl bg-black p-0">
          <div className="relative flex h-[80vh] items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 text-white hover:bg-white/20"
              onClick={prevImage}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            
            <img
              src={imageUrls[currentImageIndex]}
              alt={`${title} - תמונה ${currentImageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                console.error("Error loading gallery image:", imageUrls[currentImageIndex]);
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 text-white hover:bg-white/20"
              onClick={nextImage}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-white hover:bg-white/20"
              onClick={() => setIsGalleryOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}