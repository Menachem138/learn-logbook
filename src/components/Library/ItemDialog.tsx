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
  onSubmit: (data: Partial<LibraryItem>) => void;
  initialData?: LibraryItem | null;
}

export function ItemDialog({ isOpen, onClose, onSubmit, initialData }: ItemDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: initialData || {
      title: "",
      content: "",
      type: "note" as LibraryItemType,
    },
  });

  const selectedType = watch("type");

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    console.log("Selected files:", files);
    setSelectedFiles(files);

    // Create preview URLs for images
    if (selectedType === 'image' || selectedType === 'image_album') {
      const urls = Array.from(files).map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => {
        // Revoke old URLs to prevent memory leaks
        prev.forEach(url => URL.revokeObjectURL(url));
        return urls;
      });
    }
  };

  const onSubmitForm = async (formData: any) => {
    try {
      setIsUploading(true);
      console.log("Starting form submission with data:", formData);

      if (!selectedFiles) {
        await onSubmit(formData);
        return;
      }

      if (selectedType === 'image_album') {
        console.log("Processing image album upload");
        const uploadPromises = Array.from(selectedFiles).map(file => uploadToCloudinary(file));
        const uploadResults = await Promise.all(uploadPromises);
        
        const cloudinaryUrls = uploadResults.map(result => result.secure_url);
        console.log("Cloudinary URLs:", cloudinaryUrls);

        await onSubmit({
          ...formData,
          cloudinary_urls: cloudinaryUrls,
          type: 'image_album',
          file_details: {
            paths: cloudinaryUrls,
            names: Array.from(selectedFiles).map(f => f.name),
            type: 'image_album'
          }
        });
      } else {
        console.log("Processing single file upload");
        const file = selectedFiles[0];
        const uploadResult = await uploadToCloudinary(file);
        console.log("Upload result:", uploadResult);

        await onSubmit({
          ...formData,
          cloudinary_data: uploadResult,
          file_details: {
            path: uploadResult.secure_url,
            name: file.name,
            size: file.size,
            type: file.type
          }
        });
      }

      // Cleanup
      setSelectedFiles(null);
      setPreviewUrls([]);
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
            </select>
          </div>
          <div>
            <Textarea
              placeholder="תוכן"
              {...register("content", { required: true })}
            />
          </div>

          {(selectedType === 'image' || selectedType === 'image_album' || 
            selectedType === 'video' || selectedType === 'audio' || 
            selectedType === 'pdf') && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {selectedType === 'image_album' ? 'העלה תמונות' : 'העלה קובץ'}
              </label>
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
            </div>
          )}

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              ))}
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