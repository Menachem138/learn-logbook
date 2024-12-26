import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/utils/cloudinaryUtils";
import { UploadForm } from "./UploadForm";

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

    console.log("Selected files:", selectedFiles);
    setFiles(selectedFiles);

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
      console.log("Starting upload process with files:", files);
      
      if (type === 'image_album') {
        const uploadPromises = Array.from(files).map(file => 
          uploadToCloudinary(file)
        );

        const uploadResults = await Promise.all(uploadPromises);
        console.log("Upload results for image album:", uploadResults);

        const cloudinaryUrls = uploadResults.map(result => result.secure_url);
        console.log("Cloudinary URLs for image album:", cloudinaryUrls);

        await onSubmit({
          type,
          title,
          content,
          cloudinary_urls: cloudinaryUrls,
          file_details: {
            paths: cloudinaryUrls,
            names: Array.from(files).map(f => f.name),
            type: 'image_album'
          }
        });
      } else {
        const result = await uploadToCloudinary(files[0]);
        console.log("Upload result for single file:", result);
        
        await onSubmit({
          type,
          title,
          content,
          cloudinary_data: result,
          file_details: {
            path: result.secure_url,
            name: files[0].name,
            size: files[0].size,
            type: files[0].type
          }
        });
      }

      setType("");
      setTitle("");
      setContent("");
      setFiles(null);
      setPreviewUrls([]);
      onClose();
      toast.success("פריט נשמר בהצלחה");
      
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error("שגיאה בהעלאת הפריט");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>הוסף פריט חדש</DialogTitle>
        </DialogHeader>

        <UploadForm
          isUploading={isUploading}
          type={type}
          title={title}
          content={content}
          files={files}
          previewUrls={previewUrls}
          onTypeChange={handleTypeChange}
          onTitleChange={setTitle}
          onContentChange={setContent}
          onFileChange={handleFileChange}
          onRemoveFile={removeFile}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}