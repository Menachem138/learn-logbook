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
    if (onImageChange && Array.isArray(src) && selectedIndex > 0) {
      onImageChange(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (onImageChange && Array.isArray(src) && selectedIndex < src.length - 1) {
      onImageChange(selectedIndex + 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative flex-1 flex items-center justify-center">
          {type === "image" && typeof src === "string" && (
            <img
              src={src}
              alt={title}
              className="max-h-full max-w-full object-contain"
            />
          )}
          {type === "video" && typeof src === "string" && (
            <video controls className="max-h-full max-w-full">
              <source src={src} type="video/mp4" />
              הדפדפן שלך לא תומך בתגית וידאו.
            </video>
          )}
          {type === "pdf" && typeof src === "string" && (
            <iframe
              src={src}
              title={title}
              className="w-full h-full"
              style={{ border: "none" }}
            />
          )}
          {type === "image_gallery" && Array.isArray(src) && (
            <>
              <img
                src={src[selectedIndex]}
                alt={`${title} ${selectedIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
              {selectedIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}
              {selectedIndex < src.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}