import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "image" | "video" | "image_gallery" | "pdf";
  src: string | string[];
  title: string;
  selectedIndex?: number;
  onImageChange?: (index: number) => void;
  onDeleteImage?: (index: number) => void;
}

export function MediaViewer({
  isOpen,
  onClose,
  type,
  src,
  title,
  selectedIndex = 0,
  onImageChange,
  onDeleteImage,
}: MediaViewerProps) {
  const handlePrevious = () => {
    if (Array.isArray(src) && onImageChange) {
      const newIndex = selectedIndex > 0 ? selectedIndex - 1 : src.length - 1;
      onImageChange(newIndex);
    }
  };

  const handleNext = () => {
    if (Array.isArray(src) && onImageChange) {
      const newIndex = selectedIndex < src.length - 1 ? selectedIndex + 1 : 0;
      onImageChange(newIndex);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative overflow-hidden">
          {type === "image" && (
            <img
              src={typeof src === "string" ? src : src[0]}
              alt={title}
              className="w-full h-full object-contain"
            />
          )}
          {type === "video" && (
            <video controls className="w-full h-full">
              <source src={typeof src === "string" ? src : src[0]} type="video/mp4" />
              הדפדפן שלך לא תומך בתגית וידאו.
            </video>
          )}
          {type === "pdf" && (
            <iframe
              src={`${typeof src === "string" ? src : src[0]}#toolbar=0`}
              className="w-full h-full"
              title={title}
            />
          )}
          {type === "image_gallery" && Array.isArray(src) && (
            <>
              <div className="relative h-full">
                <img
                  src={src[selectedIndex]}
                  alt={`${title} ${selectedIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                {onDeleteImage && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => onDeleteImage(selectedIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex justify-between p-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  className="bg-white/80"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="bg-white/80 px-2 py-1 rounded">
                  {selectedIndex + 1} / {src.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="bg-white/80"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}