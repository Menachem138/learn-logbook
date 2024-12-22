import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "image_album";
  src: string | string[];
  title: string;
}

export function MediaCard({ type, src, title }: MediaCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (type === "image_album" && Array.isArray(src)) {
    return (
      <div className="relative">
        <Card className="overflow-hidden aspect-video relative">
          <img
            src={src[currentImageIndex]}
            alt={`${title} - תמונה ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
          {src.length > 1 && (
            <div className="absolute inset-x-0 bottom-0 flex justify-between p-2 bg-black/50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? src.length - 1 : prev - 1))}
                className="text-white hover:bg-black/20"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-white">
                {currentImageIndex + 1} / {src.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentImageIndex((prev) => (prev === src.length - 1 ? 0 : prev + 1))}
                className="text-white hover:bg-black/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (type === "image") {
    return (
      <Card className="overflow-hidden aspect-video">
        <img src={src as string} alt={title} className="w-full h-full object-cover" />
      </Card>
    );
  }

  if (type === "video") {
    return (
      <Card className="overflow-hidden aspect-video">
        <video src={src as string} controls className="w-full h-full" />
      </Card>
    );
  }

  if (type === "pdf") {
    return (
      <Card className="overflow-hidden aspect-[3/4]">
        <iframe src={src as string} className="w-full h-full" title={title} />
      </Card>
    );
  }

  return null;
}