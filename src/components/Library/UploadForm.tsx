import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface UploadFormProps {
  isUploading: boolean;
  type: string;
  title: string;
  content: string;
  files: FileList | null;
  previewUrls: string[];
  onTypeChange: (type: string) => void;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function UploadForm({
  isUploading,
  type,
  title,
  content,
  files,
  previewUrls,
  onTypeChange,
  onTitleChange,
  onContentChange,
  onFileChange,
  onRemoveFile,
  onSubmit,
  onCancel,
}: UploadFormProps) {
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">סוג פריט</label>
        <select
          className="w-full p-2 border rounded-md"
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
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
        onChange={(e) => onTitleChange(e.target.value)}
        required
      />

      <Textarea
        placeholder="תיאור"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
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
            onChange={onFileChange}
            className="flex-1"
            disabled={isUploading}
          />
        </div>
      )}

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
                onClick={() => onRemoveFile(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
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
  );
}