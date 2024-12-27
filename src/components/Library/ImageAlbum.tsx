import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { MediaViewer } from './MediaViewer';

interface ImageAlbumProps {
  images: string[];
  title: string;
}

export function ImageAlbum({ images, title }: ImageAlbumProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  
  console.log('ImageAlbum rendered with:', { images, title });

  if (!images || images.length === 0) {
    console.log('No images provided to ImageAlbum');
    return <div className="text-gray-500">אין תמונות באלבום</div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-1 aspect-video">
        {images.slice(0, 4).map((image, index) => (
          <Card 
            key={index}
            className="overflow-hidden cursor-pointer group relative aspect-square"
            onClick={() => setSelectedImageIndex(index)}
          >
            <img 
              src={image} 
              alt={`${title} - תמונה ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                console.error('Image failed to load:', image);
                const imgElement = e.target as HTMLImageElement;
                imgElement.style.display = 'none';
              }}
            />
            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-xl font-bold">+{images.length - 4}</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      <MediaViewer
        isOpen={selectedImageIndex !== -1}
        onClose={() => setSelectedImageIndex(-1)}
        type="image_gallery"
        src={images}
        title={title}
      />
    </>
  );
}