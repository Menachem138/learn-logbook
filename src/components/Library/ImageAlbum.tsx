import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { MediaViewer } from "./MediaViewer";
import { ImageDetails } from "@/types/library";

interface ImageAlbumProps {
  images: ImageDetails[];
  title: string;
}

export function ImageAlbum({ images, title }: ImageAlbumProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!images.length) return null;

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsViewerOpen(true);
  };

  const renderAlbumPreview = () => {
    if (images.length === 1) {
      return (
        <img
          src={images[0].path}
          alt={title}
          className="w-full h-full object-cover rounded-lg cursor-pointer"
          onClick={() => handleImageClick(0)}
        />
      );
    }

    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 h-full">
          {images.map((image, index) => (
            <img
              key={image.path}
              src={image.path}
              alt={image.title || title}
              className="w-full h-full object-cover rounded-lg cursor-pointer"
              onClick={() => handleImageClick(index)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-1 h-full">
        <img
          src={images[0].path}
          alt={images[0].title || title}
          className="w-full h-full object-cover rounded-lg cursor-pointer"
          onClick={() => handleImageClick(0)}
        />
        <div className="grid grid-rows-2 gap-1">
          <img
            src={images[1].path}
            alt={images[1].title || title}
            className="w-full h-full object-cover rounded-lg cursor-pointer"
            onClick={() => handleImageClick(1)}
          />
          <div
            className="relative cursor-pointer"
            onClick={() => handleImageClick(2)}
          >
            <img
              src={images[2].path}
              alt={images[2].title || title}
              className="w-full h-full object-cover rounded-lg brightness-50"
            />
            {images.length > 3 && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                +{images.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="overflow-hidden cursor-pointer group relative h-[300px]">
        {renderAlbumPreview()}
      </Card>

      <MediaViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        type="image"
        src={images[selectedImageIndex].path}
        title={images[selectedImageIndex].title || title}
        onNext={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
        onPrevious={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
        hasNavigation={images.length > 1}
        totalImages={images.length}
        currentIndex={selectedImageIndex}
      />
    </>
  );
}