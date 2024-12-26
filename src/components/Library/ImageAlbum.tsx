import React from "react";
import { Card } from "@/components/ui/card";

interface ImageAlbumProps {
  images: { url: string; publicId: string }[];
  itemId: string;
  onUpdate: () => void;
}

export function ImageAlbum({ images, itemId, onUpdate }: ImageAlbumProps) {
  console.log("ImageAlbum rendered with:", { images, itemId });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {images.map((image, index) => (
          <Card key={index} className="p-2">
            <img
              src={image.url}
              alt=""
              className="w-full h-auto object-cover"
            />
          </Card>
        ))}
      </div>
    </div>
  );
}