import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "image" | "video" | "pdf";
  src: string;
  title: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNavigation?: boolean;
  totalImages?: number;
  currentIndex?: number;
}

export function MediaViewer({
  isOpen,
  onClose,
  type,
  src,
  title,
  onNext,
  onPrevious,
  hasNavigation,
  totalImages,
  currentIndex,
}: MediaViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
        <div className="relative flex-1 flex items-center justify-center">
          {type === "image" && (
            <img
              src={src}
              alt={title}
              className="max-h-full max-w-full object-contain"
            />
          )}
          {type === "video" && (
            <video controls className="max-h-full max-w-full">
              <source src={src} type="video/mp4" />
              הדפדפן שלך לא תומך בתגית וידאו.
            </video>
          )}
          {hasNavigation && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2"
                onClick={onPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={onNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
        {hasNavigation && (
          <div className="text-center mt-2">
            {currentIndex! + 1} מתוך {totalImages}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}