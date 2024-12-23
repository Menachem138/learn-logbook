import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "image" | "video" | "image_gallery";
  src: string | string[];
  title: string;
  selectedIndex?: number;
  onImageChange?: (index: number) => void;
}

export function MediaViewer({ 
  isOpen, 
  onClose, 
  type, 
  src, 
  title,
  selectedIndex = 0,
  onImageChange 
}: MediaViewerProps) {
  if (type === "image_gallery" && Array.isArray(src)) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full p-6 bg-black/95 border-none">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 bg-black/20 hover:bg-black/40"
            onClick={onClose}
          >
            <X className="h-4 w-4 text-white" />
          </Button>

          <Carousel className="w-full">
            <CarouselContent>
              {src.map((imgSrc, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full aspect-[16/9]">
                    <img
                      src={imgSrc}
                      alt={`${title} ${index + 1}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
          
          <ScrollArea className="w-full mt-4">
            <div className="flex gap-4 p-2">
              {src.map((image, index) => (
                <button
                  key={index}
                  onClick={() => onImageChange?.(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden focus:outline-none transition-all duration-200 hover:scale-105 ${
                    index === selectedIndex ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${title} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-6">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 bg-black/20 hover:bg-black/40"
            onClick={onClose}
          >
            <X className="h-4 w-4 text-white" />
          </Button>
          {type === "image" && typeof src === 'string' ? (
            <img
              src={src}
              alt={title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          ) : type === "video" && typeof src === 'string' ? (
            <video
              src={src}
              controls
              className="w-full max-h-[80vh] rounded-lg"
              autoPlay
            >
              <source src={src} type="video/mp4" />
              הדפדפן שלך לא תומך בתגית וידאו.
            </video>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}