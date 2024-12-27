import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "image" | "video" | "pdf" | "image_gallery";
  src: string | string[];
  title: string;
}

export function MediaViewer({ isOpen, onClose, type, src, title }: MediaViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const handlePrevImage = () => {
    if (Array.isArray(src)) {
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : src.length - 1));
    }
  };

  const handleNextImage = () => {
    if (Array.isArray(src)) {
      setCurrentImageIndex((prev) => (prev < src.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10 bg-black/20 hover:bg-black/40"
            onClick={onClose}
          >
            <X className="h-4 w-4 text-white" />
          </Button>
          
          {type === "image_gallery" && Array.isArray(src) ? (
            <div className="relative">
              <img
                src={src[currentImageIndex]}
                alt={`${title} - תמונה ${currentImageIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              {src.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {src.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
              {src.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40"
                    onClick={handlePrevImage}
                  >
                    <X className="h-4 w-4 text-white rotate-45" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40"
                    onClick={handleNextImage}
                  >
                    <X className="h-4 w-4 text-white -rotate-135" />
                  </Button>
                </>
              )}
            </div>
          ) : type === "image" ? (
            <img
              src={src as string}
              alt={title}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          ) : type === "video" ? (
            <video
              src={src as string}
              controls
              className="w-full max-h-[80vh]"
              autoPlay
            >
              <source src={src as string} type="video/mp4" />
              הדפדפן שלך לא תומך בתגית וידאו.
            </video>
          ) : type === "pdf" ? (
            <iframe
              src={src as string}
              className="w-full h-[80vh]"
              title={title}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}