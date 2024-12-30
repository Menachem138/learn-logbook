import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { LibraryItem, LibraryItemType, LibraryItemInput } from "@/types/library";
import { useToast } from "@/hooks/use-toast";
import { FormFields } from "./FormFields";
import { FileUpload } from "./FileUpload";
import { DialogFooter } from "./DialogFooter";

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
          <div className="space-y-4 flex-1 overflow-y-auto">
            <FormFields register={register} selectedType={selectedType} />

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

          <DialogFooter onClose={onClose} initialData={initialData} />
        </form>
      </DialogContent>
    </Dialog>
  );
}