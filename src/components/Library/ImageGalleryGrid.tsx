import { useState } from "react";

interface ImageGalleryGridProps {
  images: string[];
  title: string;
  onImageClick: () => void;
}

export function ImageGalleryGrid({ images, title, onImageClick }: ImageGalleryGridProps) {
  const displayedImages = images.slice(0, 4);
  const remainingCount = images.length - 4;

  return (
    <div className="grid grid-cols-2 gap-1">
      {displayedImages.map((imgSrc, index) => (
        <div 
          key={index} 
          className="relative aspect-square cursor-pointer group"
          onClick={onImageClick}
        >
          {index === 3 && remainingCount > 0 ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">+{remainingCount}</span>
            </div>
          ) : null}
          <img 
            src={imgSrc} 
            alt={`${title} ${index + 1}`}
            className="w-full h-full object-cover transition-all duration-200 group-hover:scale-[1.02]"
            loading="lazy"
            onError={(e) => {
              console.error("Image failed to load:", imgSrc);
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
      ))}
    </div>
  );
}