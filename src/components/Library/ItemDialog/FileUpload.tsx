import React from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { LibraryItemType } from "@/types/library";

interface FileUploadProps {
  type: LibraryItemType;
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
  setExistingPaths 
}: FileUploadProps) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': [],
      'application/pdf': []
    },
    onDrop: (acceptedFiles) => {
      console.log("Files dropped:", acceptedFiles);
      // Keep original file name for PDFs
      const processedFiles = acceptedFiles.map(file => {
        if (file.type === 'application/pdf') {
          // Create a new File object with the original name
          return new File([file], file.name, {
            type: file.type,
            lastModified: file.lastModified,
          });
        }
        return file;
      });

      if (type === 'image_gallery') {
        setSelectedFiles(prevFiles => [...prevFiles, ...processedFiles]);
      } else {
        setSelectedFiles([processedFiles[0]]);
      }
    }
  });

  const handleRemoveExistingImage = (indexToRemove: number) => {
    console.log("Removing image at index:", indexToRemove);
    setExistingPaths(prevPaths => 
      prevPaths.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <div className="space-y-2">
      <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary">
        <input {...getInputProps()} />
        <p>גרור קבצים לכאן או לחץ לבחירת קבצים</p>
        {type === 'image_gallery' && <p className="text-sm text-gray-500">ניתן להעלות מספר תמונות</p>}
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
          <div className="grid grid-cols-4 gap-2">
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
