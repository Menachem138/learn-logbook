import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LibraryItem, LibraryItemType } from "@/types/library";

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<LibraryItem> & { files?: FileList }) => void;
  initialData?: LibraryItem | null;
  defaultType?: LibraryItemType;
}

export function ItemDialog({ isOpen, onClose, onSubmit, initialData, defaultType = "note" }: ItemDialogProps) {
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: initialData || {
      title: "",
      content: "",
      type: defaultType,
    },
  });

  const selectedType = watch("type");
  const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFiles(null);
      reset(initialData || { title: "", content: "", type: defaultType });
    }
  }, [isOpen, initialData, reset, defaultType]);

  const onSubmitForm = (data: any) => {
    const formData = {
      ...data,
      files: selectedFiles,
    };
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>{initialData ? 'ערוך פריט' : 'הוסף פריט חדש'}</DialogTitle>
          <DialogDescription id="dialog-description">
            {initialData ? 'ערוך את פרטי הפריט' : 'הוסף פריט חדש לספרייה'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Select
              {...register("type")}
              defaultValue={defaultType}
              onValueChange={(value) => reset({ ...watch(), type: value as LibraryItemType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">הערה</SelectItem>
                <SelectItem value="link">קישור</SelectItem>
                <SelectItem value="image">תמונה</SelectItem>
                <SelectItem value="image_album">אלבום תמונות</SelectItem>
                <SelectItem value="video">וידאו</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="question">שאלה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            {...register("title")}
            placeholder="כותרת"
          />

          <Input
            {...register("content")}
            placeholder="תוכן"
          />

          {(selectedType === "image" || selectedType === "image_album" || selectedType === "video" || selectedType === "pdf") && (
            <Input
              type="file"
              onChange={(e) => setSelectedFiles(e.target.files)}
              multiple={selectedType === "image_album"}
              accept={
                selectedType === "image" || selectedType === "image_album"
                  ? "image/*"
                  : selectedType === "video"
                  ? "video/*"
                  : "application/pdf"
              }
            />
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit">
              {initialData ? 'עדכן' : 'הוסף'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}