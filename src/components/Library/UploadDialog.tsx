import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Upload, File, Image, Video, FileText, Music, X } from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/utils/cloudinaryUtils";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function UploadDialog({ isOpen, onClose, onSubmit }: UploadDialogProps) {
  const [type, setType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setFiles(null);
    setPreviewUrls([]);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setFiles(selectedFiles);

    // Create preview URLs for images
    if (type === 'image' || type === 'image_album') {
      const urls = Array.from(selectedFiles).map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const removeFile = (index: number) => {
    if (!files) return;

    const dt = new DataTransfer();
    Array.from(files).forEach((file, i) => {
      if (i !== index) dt.items.add(file);
    });

    setFiles(dt.files);
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      toast.error("Please select file(s) to upload");
      return;
    }

    try {
      setIsUploading(true);
      
      if (type === 'image_album') {
        const uploadPromises = Array.from(files).map(file => 
          uploadToCloudinary(file)
        );

        const uploadResults = await Promise.all(uploadPromises);
        const cloudinaryUrls = uploadResults.map(result => result.url);

        await onSubmit({
          type,
          title,
          content,
          cloudinary_urls: cloudinaryUrls
        });
      } else {
        const result = await uploadToCloudinary(files[0]);
        
        await onSubmit({
          type,
          title,
          content,
          cloudinary_data: result,
          file_details: {
            path: result.url,
            name: files[0].name,
            size: files[0].size,
            type: files[0].type
          }
        });
      }

      // Reset form
      setType("");
      setTitle("");
      setContent("");
      setFiles(null);
      setPreviewUrls([]);
      onClose();
      
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error("Failed to upload file(s)");
    } finally {
      setIsUploading(false);
    }
  };

  const getAcceptedFileTypes = () => {
    switch (type) {
      case 'image':
      case 'image_album':
        return "image/*";
      case 'video':
        return "video/*";
      case 'audio':
        return "audio/*";
      case 'pdf':
        return ".pdf";
      default:
        return undefined;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>הוסף פריט חדש</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">סוג פריט</label>
            <select
              className="w-full p-2 border rounded-md"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="">בחר סוג</option>
              <option value="image">תמונה בודדת</option>
              <option value="image_album">אלבום תמונות</option>
              <option value="video">וידאו</option>
              <option value="audio">אודיו</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          <Input
            placeholder="כותרת"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            placeholder="תיאור"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          {type && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                {type === 'image_album' ? 'העלה תמונות' : 'העלה קובץ'}
              </label>
              <Input
                type="file"
                accept={getAcceptedFileTypes()}
                multiple={type === 'image_album'}
                onChange={handleFileChange}
                className="flex-1"
                disabled={isUploading}
              />
            </div>
          )}

          {/* Preview for images */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              ביטול
            </Button>
            <Button type="submit" disabled={isUploading || !type || !title || !content || !files}>
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Upload className="animate-spin" />
                  מעלה...
                </span>
              ) : (
                "הוסף"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}