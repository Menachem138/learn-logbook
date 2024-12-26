import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { deleteFromCloudinary } from '@/utils/cloudinaryUtils';

interface ImageAlbumCardProps {
  images: Array<{ url: string; publicId: string }>;
  title: string;
  itemId: string;
  onUpdate: () => void;
}

export const ImageAlbumCard: React.FC<ImageAlbumCardProps> = ({
  images,
  title,
  itemId,
  onUpdate
}) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  const displayImages = images.slice(0, 4);
  const remainingCount = Math.max(0, images.length - 4);

  const handleDeleteImage = async (publicId: string, index: number) => {
    try {
      // Delete from Cloudinary
      await deleteFromCloudinary(publicId);

      // Update the library item
      const updatedImages = images.filter((_, i) => i !== index);
      const { error } = await supabase
        .from('library_items')
        .update({
          cloudinary_urls: updatedImages
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "התמונה נמחקה בהצלחה",
      });

      onUpdate();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "שגיאה במחיקת התמונה",
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Card 
        className="relative overflow-hidden cursor-pointer group"
        onClick={() => !isEditMode && setIsGalleryOpen(true)}
      >
        <div className="grid grid-cols-2 gap-1 p-1">
          {displayImages.map((image, index) => (
            <div 
              key={index}
              className="relative aspect-square"
            >
              <img
                src={image.url}
                alt={`${title} - ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 3 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                  +{remainingCount}
                </div>
              )}
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditMode(true);
          }}
        >
          ערוך
        </Button>
      </Card>

      {/* Gallery Dialog */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <img
              src={images[currentImageIndex].url}
              alt={`${title} - ${currentImageIndex + 1}`}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2"
              onClick={handlePrevious}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleNext}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ערוך אלבום</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`${title} - ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteImage(image.publicId, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};