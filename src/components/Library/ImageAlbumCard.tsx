import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ImageAlbumCardProps {
  urls: string[];
  title: string;
  onDelete?: (index: number) => void;
  isEditing?: boolean;
}

export function ImageAlbumCard({ urls, title, onDelete, isEditing }: ImageAlbumCardProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const displayUrls = urls.slice(0, 4);
  const remainingCount = Math.max(0, urls.length - 4);

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % urls.length);
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + urls.length) % urls.length);
  };

  const handleDelete = (index: number) => {
    if (onDelete) {
      onDelete(index);
      toast.success("התמונה נמחקה בהצלחה");
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer"
        onClick={() => !isEditing && setIsGalleryOpen(true)}
      >
        <div className="grid grid-cols-2 gap-1 p-1">
          {displayUrls.map((url, index) => (
            <div 
              key={index}
              className="relative aspect-square"
            >
              <img
                src={url}
                alt={`${title} - ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 3 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">+{remainingCount}</span>
                </div>
              )}
              {isEditing && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-black/20 hover:bg-black/40"
              onClick={() => setIsGalleryOpen(false)}
            >
              <X className="h-4 w-4 text-white" />
            </Button>
            <div className="relative">
              <img
                src={urls[currentImageIndex]}
                alt={`${title} - ${currentImageIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/20 hover:bg-black/40"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/20 hover:bg-black/40"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}