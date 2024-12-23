import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { LibraryItem, LibraryItemType } from "@/types/library";
import { useDropzone } from "react-dropzone";
import { toast } from "@/components/ui/use-toast";

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<LibraryItem> & { files?: File[] }) => void;
  initialData?: LibraryItem | null;
  initialType?: LibraryItemType;
}

export function ItemDialog({ isOpen, onClose, onSubmit, initialData, initialType }: ItemDialogProps) {
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: initialData || {
      title: "",
      content: "",
      type: initialType || "note" as LibraryItemType,
    },
  });

  const selectedType = watch("type");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);

  const onSubmitForm = (data: any) => {
    try {
      console.log("Submitting form with data:", { ...data, files: selectedFiles });
      
      if ((selectedType === 'image' || selectedType === 'video' || selectedType === 'pdf') && selectedFiles.length === 0) {
        toast({
          title: "שגיאה",
          description: "נא להעלות קובץ",
          variant: "destructive",
        });
        return;
      }

      if (selectedType === 'image_gallery' && selectedFiles.length === 0) {
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
      };
      
      onSubmit(formData);
      setSelectedFiles([]);
      reset();
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
