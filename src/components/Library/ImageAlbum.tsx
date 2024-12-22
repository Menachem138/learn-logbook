import { useState } from "react";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageAlbumProps {
  images: string[];
  title: string;
  onImageClick?: () => void;
}

export function ImageAlbum({ images, title, onImageClick }: ImageAlbumProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleClick = () => {
    setIsViewerOpen(true);
    onImageClick?.();
  };

  const remainingImages = images.length > 4 ? images.length - 4 : 0;

  return (
    <>
      <div 
        className="grid grid-cols-2 gap-0.5 cursor-pointer overflow-hidden rounded-lg"
        onClick={handleClick}
        role="button"
        aria-label={`Open ${title} album with ${images.length} images`}
      >
        {images.slice(0, 4).map((image, index) => (
          <div 
            key={index} 
            className={`relative ${index === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}
          >
            <img
              src={image}
              alt={`${title} ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {index === 3 && remainingImages > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-xl font-bold">+{remainingImages}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogDescription className="sr-only">
            Image viewer for {title} album
          </DialogDescription>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-black/20 hover:bg-black/40"
              onClick={() => setIsViewerOpen(false)}
              aria-label="Close image viewer"
            >
              <X className="h-4 w-4 text-white" />
            </Button>
            <div className="relative w-full aspect-video">
              <img
                src={images[selectedImageIndex]}
                alt={`${title} ${selectedImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex gap-2 p-4 overflow-x-auto bg-black/5">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden focus:outline-none ${
                    selectedImageIndex === index ? 'ring-2 ring-primary' : ''
                  }`}
                  aria-label={`View image ${index + 1} of ${images.length}`}
                  aria-pressed={selectedImageIndex === index}
                >
                  <img
                    src={image}
                    alt={`${title} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}