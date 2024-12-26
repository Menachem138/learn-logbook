import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { LibraryItem, LibraryItemType } from "@/types/library";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/utils/cloudinaryUtils";

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<LibraryItem> & { files?: FileList }) => void;
  initialData?: LibraryItem | null;
}

export function ItemDialog({ isOpen, onClose, onSubmit, initialData }: ItemDialogProps) {
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: initialData || {
      title: "",
      content: "",
      type: "note" as LibraryItemType,
    },
  });

  const selectedType = watch("type");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log("Selected files:", files);
    if (files) {
      setSelectedFiles(files);
    }
  };

  const onSubmitForm = async (data: any) => {
    try {
      setIsUploading(true);
      
      if (selectedType === 'image_album' && selectedFiles) {
        console.log("Processing image album with files:", selectedFiles);
        
        const uploadPromises = Array.from(selectedFiles).map(file => 
          uploadToCloudinary(file)
        );

        const uploadResults = await Promise.all(uploadPromises);
        console.log("Upload results:", uploadResults);

        const cloudinaryUrls = uploadResults.map(result => result.url);
        console.log("Cloudinary URLs:", cloudinaryUrls);

        // Submit with cloudinary URLs
        await onSubmit({
          ...data,
          cloudinary_urls: cloudinaryUrls,
          type: 'image_album'
        });
      } else {
        // Handle other types
        await onSubmit({
          ...data,
          files: selectedFiles
        });
      }

      setSelectedFiles(null);
      reset();
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "ערוך פריט" : "הוסף פריט חדש"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div>
            <Input
              placeholder="כותרת"
              {...register("title", { required: true })}
            />
          </div>
          <div>
            <select
              className="w-full p-2 border rounded-md"
              {...register("type", { required: true })}
            >
              <option value="note">הערה</option>
              <option value="link">קישור</option>
              <option value="image">תמונה</option>
              <option value="image_album">אלבום תמונות</option>
              <option value="video">וידאו</option>
              <option value="whatsapp">וואטסאפ</option>
              <option value="pdf">PDF</option>
              <option value="question">שאלה</option>
            </select>
          </div>
          <div>
            <Textarea
              placeholder={selectedType === 'question' ? "מה השאלה שלך?" : "תוכן"}
              {...register("content", { required: true })}
            />
          </div>

          {selectedType === 'image_album' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                העלה תמונות לאלבום
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="flex-1"
                  disabled={isUploading}
                />
                {selectedFiles && selectedFiles.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {selectedFiles.length} תמונות נבחרו
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              ביטול
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Upload className="animate-spin" />
                  מעלה...
                </span>
              ) : (
                initialData ? "עדכן" : "הוסף"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}