import React from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface FileUploadProps {
  type: string;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  existingPaths: string[];
  setExistingPaths: React.Dispatch<React.SetStateAction<string[]>>;
}

export function FileUpload({
  type,
  selectedFiles,
  setSelectedFiles,
  existingPaths,
  setExistingPaths,
}: FileUploadProps) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': [],
      'application/pdf': []
    },
    onDrop: (acceptedFiles) => {
      if (type === 'image_gallery') {
        setSelectedFiles(prev => [...prev, ...acceptedFiles]);
      } else {
        setSelectedFiles([acceptedFiles[0]]);
      }
    }
  });

  const handleRemoveExistingImage = (indexToRemove: number) => {
    setExistingPaths(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col space-y-4 max-h-[50vh] overflow-y-auto">
      <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary min-h-[100px] flex items-center justify-center">
        <input {...getInputProps()} />
        <div>
          <p>גרור קבצים לכאן או לחץ לבחירת קבצים</p>
          {type === 'image_gallery' && <p className="text-sm text-gray-500">ניתן להעלות מספר תמונות</p>}
        </div>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-500">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
              >
                הסר
              </Button>
            </div>
          ))}
        </div>
      )}

      {type === 'image_gallery' && existingPaths.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">תמונות קיימות באלבום:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {existingPaths.map((path, index) => (
              <div key={index} className="relative aspect-square group">
                <img src={path} alt={`תמונה ${index + 1}`} className="w-full h-full object-cover rounded" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveExistingImage(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}