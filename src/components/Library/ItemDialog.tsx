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
      console.log("Starting form submission with data:", data);
      
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
      } else if (selectedFiles && selectedFiles.length > 0) {
        // Handle single file upload for other types
        console.log("Processing single file upload");
        const file = selectedFiles[0];
        const uploadResult = await uploadToCloudinary(file);
        console.log("Single file upload result:", uploadResult);

        await onSubmit({
          ...data,
          file_details: {
            path: uploadResult.url,
            name: file.name,
            size: file.size,
            type: file.type
          },
          cloudinary_data: uploadResult
        });
      } else {
        // Handle text-only submissions
        console.log("Submitting text-only data");
        await onSubmit(data);
      }

      setSelectedFiles(null);
      reset();
      onClose();
      toast.success("פריט נשמר בהצלחה");
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error("שגיאה בשמירת הפריט");
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
              <option value="audio">אודיו</option>
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

          {(selectedType === 'image_album' || selectedType === 'image' || 
            selectedType === 'video' || selectedType === 'audio' || 
            selectedType === 'pdf') && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {selectedType === 'image_album' ? 'העלה תמונות' : 'העלה קובץ'}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept={
                    selectedType === 'image' || selectedType === 'image_album' 
                      ? "image/*"
                      : selectedType === 'video'
                      ? "video/*"
                      : selectedType === 'audio'
                      ? "audio/*"
                      : selectedType === 'pdf'
                      ? ".pdf"
                      : undefined
                  }
                  multiple={selectedType === 'image_album'}
                  onChange={handleFileChange}
                  className="flex-1"
                  disabled={isUploading}
                />
                {selectedFiles && selectedFiles.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {selectedFiles.length} {selectedType === 'image_album' ? 'תמונות' : 'קובץ'} נבחרו
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