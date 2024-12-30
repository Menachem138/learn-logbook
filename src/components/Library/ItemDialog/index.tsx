import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { LibraryItem, LibraryItemType, LibraryItemInput } from "@/types/library";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "./FileUpload";

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
  const { toast } = useToast();

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
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{initialData ? "ערוך פריט" : "הוסף פריט חדש"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="flex-1 flex flex-col space-y-4 overflow-y-auto">
          <div className="space-y-4">
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
              <FileUpload
                type={selectedType}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                existingPaths={existingPaths}
                setExistingPaths={setExistingPaths}
              />
            )}
          </div>

          <div className="sticky bottom-0 bg-background pt-2 border-t mt-auto">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                ביטול
              </Button>
              <Button type="submit">
                {initialData ? "עדכן" : "הוסף"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}