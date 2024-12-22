import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { MediaViewer } from "./MediaViewer";
import { ImageDetails } from "@/types/library";
import { Images } from "lucide-react";

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
          className="w-full h-[200px] object-cover rounded-lg cursor-pointer"
          onClick={() => handleImageClick(0)}
        />
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2 h-[200px]">
        <div className="col-span-1 h-full">
          <img
            src={images[0].path}
            alt={images[0].title || title}
            className="w-full h-full object-cover rounded-lg cursor-pointer"
            onClick={() => handleImageClick(0)}
          />
        </div>
        <div className="col-span-1 grid grid-rows-2 gap-2 h-full">
          {images[1] && (
            <img
              src={images[1].path}
              alt={images[1].title || title}
              className="w-full h-full object-cover rounded-lg cursor-pointer"
              onClick={() => handleImageClick(1)}
            />
          )}
          <div className="relative">
            {images[2] && (
              <>
                <img
                  src={images[2].path}
                  alt={images[2].title || title}
                  className={`w-full h-full object-cover rounded-lg cursor-pointer ${
                    images.length > 3 ? 'brightness-50' : ''
                  }`}
                  onClick={() => handleImageClick(2)}
                />
                {images.length > 3 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white">
                      <Images className="w-5 h-5" />
                      <span className="text-lg font-medium">+{images.length - 3}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="overflow-hidden group relative">
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