import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { LibraryItem, LibraryItemType, LibraryItemInput } from "@/types/library";
import { useDropzone } from "react-dropzone";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LibraryItemInput) => void;
  initialData?: LibraryItem | null;
}

export function ItemDialog({ isOpen, onClose, onSubmit, initialData }: ItemDialogProps) {
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: initialData || {
      title: "",
      content: "",
      type: "note" as LibraryItemType,
    },
  });

  const selectedType = watch("type");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [existingPaths, setExistingPaths] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (initialData?.type === 'image_gallery' && initialData.file_details?.paths) {
      setExistingPaths(initialData.file_details.paths);
    }
  }, [initialData]);

  const onSubmitForm = async (data: any) => {
    try {
      console.log("Submitting form with data:", { ...data, files: selectedFiles, existingPaths });
      
      if ((selectedType === 'image' || selectedType === 'video' || selectedType === 'pdf') && selectedFiles.length === 0 && !initialData?.file_details) {
        toast({
          title: "שגיאה",
          description: "נא להעלות קובץ",
          variant: "destructive",
        });
        return;
      }

      if (selectedType === 'image_gallery' && selectedFiles.length === 0 && existingPaths.length === 0) {
        toast({
          title: "שגיאה",
          description: "נא להעלות לפחות תמונה אחת",
          variant: "destructive",
        });
        return;
      }

      const formData = {
        ...data,
        files: selectedFiles,
        file_details: selectedType === 'image_gallery' ? { paths: existingPaths } : initialData?.file_details,
      };
      
      await onSubmit(formData);
      setSelectedFiles([]);
      setExistingPaths([]);
      reset();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הפריט",
        variant: "destructive",
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': [],
      'application/pdf': []
    },
    onDrop: (acceptedFiles) => {
      console.log("Files dropped:", acceptedFiles);
      if (selectedType === 'image_gallery') {
        setSelectedFiles(prev => [...prev, ...acceptedFiles]);
      } else {
        setSelectedFiles([acceptedFiles[0]]);
      }
    }
  });

  const handleRemoveExistingImage = (indexToRemove: number) => {
    console.log("Removing image at index:", indexToRemove);
    setExistingPaths(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setExistingPaths([]);
      reset();
    } else if (initialData) {
      reset(initialData);
      if (initialData.type === 'image_gallery' && initialData.file_details?.paths) {
        setExistingPaths(initialData.file_details.paths);
      }
    }
  }, [isOpen, reset, initialData]);

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
              disabled={!!initialData}
            >
              <option value="note">הערה</option>
              <option value="link">קישור</option>
              <option value="image">תמונה</option>
              <option value="image_gallery">אלבום תמונות</option>
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

          {(selectedType === 'image' || selectedType === 'image_gallery' || selectedType === 'video' || selectedType === 'pdf') && (
            <div className="space-y-2">
              <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary">
                <input {...getInputProps()} />
                <p>גרור קבצים לכאן או לחץ לבחירת קבצים</p>
                {selectedType === 'image_gallery' && <p className="text-sm text-gray-500">ניתן להעלות מספר תמונות</p>}
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
              {initialData?.type === 'image_gallery' && existingPaths.length > 0 && (
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
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit">
              {initialData ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}