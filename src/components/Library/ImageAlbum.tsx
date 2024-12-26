import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageAlbumProps {
  images: { url: string; publicId: string }[];
  itemId: string;
  onUpdate: () => void;
}

export function ImageAlbum({ images, itemId, onUpdate }: ImageAlbumProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pendingImages, setPendingImages] = useState(images);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDeleteImage = async (publicId: string) => {
    try {
      // Delete from Cloudinary
      const response = await fetch('/api/delete-cloudinary-asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image from Cloudinary');
      }

      // Update Supabase record
      const updatedImages = pendingImages.filter(img => img.publicId !== publicId);
      const { error } = await supabase
        .from('library_items')
        .update({
          cloudinary_urls: updatedImages
        })
        .eq('id', itemId);

      if (error) throw error;

      setPendingImages(updatedImages);
      toast.success('התמונה נמחקה בהצלחה');
      onUpdate();
      
      if (updatedImages.length === 0) {
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('אירעה שגיאה במחיקת התמונה');
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview Grid */}
      <div className="grid grid-cols-2 gap-2">
        {images.slice(0, 4).map((image, index) => (
          <div
            key={index}
            className="relative cursor-pointer overflow-hidden rounded-md aspect-square"
            onClick={() => handleImageClick(index)}
          >
            <img
              src={image.url}
              alt=""
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-xl font-bold">+{images.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setEditMode(true)}
          className="flex items-center gap-2"
        >
          <Pencil className="h-4 w-4" />
          ערוך אלבום
        </Button>
      </div>

      {/* Image Viewer */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader>
            <DialogTitle className="sr-only">Image Viewer</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-black/20 hover:bg-black/40"
              onClick={() => setViewerOpen(false)}
            >
              <X className="h-4 w-4 text-white" />
            </Button>
            
            <div className="relative">
              <img
                src={images[currentIndex].url}
                alt=""
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Mode */}
      <Dialog open={editMode} onOpenChange={setEditMode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>עריכת אלבום</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 p-4">
            {pendingImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt=""
                  className="w-full aspect-square object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteImage(image.publicId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}