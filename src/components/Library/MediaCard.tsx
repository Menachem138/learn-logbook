import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FileText } from "lucide-react";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "image_gallery";
  src: string | string[];
  title: string;
  onDeleteImage?: (index: number) => void;
}

export function MediaCard({ type, src, title, onDeleteImage }: MediaCardProps) {
  console.log("MediaCard props:", { type, src, title });

  if (type === "image_gallery" && Array.isArray(src)) {
    console.log("Rendering image gallery with sources:", src);
    return (
      <div className="grid grid-cols-2 gap-2 p-2">
        {src.map((imageSrc, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={imageSrc}
              alt={`${title} ${index + 1}`}
              className="w-full h-full object-cover rounded"
            />
            {onDeleteImage && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDeleteImage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (type === "pdf") {
    return (
      <div className="relative aspect-video bg-gray-100 flex items-center justify-center rounded">
        <FileText className="w-12 h-12 text-red-500" />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center">
          {title}
        </div>
      </div>
    );
  }

  if (type === "video") {
    return (
      <video
        src={src as string}
        controls
        className="w-full h-full object-cover rounded"
      />
    );
  }

  // Default case - single image
  return (
    <img
      src={src as string}
      alt={title}
      className="w-full h-full object-cover rounded"
    />
  );
}