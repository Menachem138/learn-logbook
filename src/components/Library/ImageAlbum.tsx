import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X, Trash2, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ImageAlbumProps {
  images: { path: string; title: string }[];
  onDeleteImage?: (index: number) => void;
}

export function ImageAlbum({ images, onDeleteImage }: ImageAlbumProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDeleteImage = (index: number) => {
    if (onDeleteImage) {
      onDeleteImage(index);
      toast({
        title: "התמונה נמחקה בהצלחה",
      });
    }
  };

  const displayImages = images.slice(0, 4);
  const remainingCount = Math.max(0, images.length - 3);

  return (
    <>
      <div className="relative">
        <div className="grid grid-cols-2 gap-2">
          {displayImages.map((image, index) => (
            <div
              key={index}
              className={`relative ${index === 3 && images.length > 4 ? "cursor-pointer" : ""}`}
              onClick={() => {
                setCurrentImageIndex(index);
                setIsViewerOpen(true);
              }}
            >
              <img
                src={image.path}
                alt={image.title}
                className="w-full h-32 object-cover rounded-lg"
              />
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <span className="text-white text-xl font-bold">+{remainingCount}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 z-10"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditMode(true);
          }}
        >
          <Pencil className="h-4 w-4 mr-2" />
          ערוך אלבום
        </Button>
      </div>

      {/* Gallery Viewer */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-black/20 hover:bg-black/40"
              onClick={() => setIsViewerOpen(false)}
            >
              <X className="h-4 w-4 text-white" />
            </Button>
            <img
              src={images[currentImageIndex]?.path}
              alt={images[currentImageIndex]?.title}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40"
              onClick={handlePrevImage}
            >
              <ArrowLeft className="h-6 w-6 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40"
              onClick={handleNextImage}
            >
              <ArrowRight className="h-6 w-6 text-white" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Mode Dialog */}
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>ערוך אלבום תמונות</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {images.map((image, index) => (
              <Card key={index} className="relative group">
                <img
                  src={image.path}
                  alt={image.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteImage(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}