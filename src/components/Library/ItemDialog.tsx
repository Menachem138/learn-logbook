import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { LibraryItem, LibraryItemType } from "@/types/library";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<LibraryItem> & { files?: FileList }) => void;
  initialData?: LibraryItem | null;
}

export function ItemDialog({ isOpen, onClose, onSubmit, initialData }: ItemDialogProps) {
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: initialData || {
      title: "",
      content: "",
      type: "note" as LibraryItemType,
    },
  });

  const selectedType = watch("type");
  const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(null);

  console.log("Selected type:", selectedType);
  console.log("Selected files:", selectedFiles);

  const onSubmitForm = (data: any) => {
    console.log("Submitting form with data:", data);
    const formData = {
      ...data,
      files: selectedFiles,
    };
    onSubmit(formData);
    setSelectedFiles(null);
    reset();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log("Files selected:", files);
    if (files) {
      setSelectedFiles(files);
    }
  };

  const handleTypeChange = (value: string) => {
    setValue("type", value as LibraryItemType);
    setSelectedFiles(null);
  };

  const isImageType = selectedType === 'image' || selectedType === 'image_album';
  const isFileUploadType = isImageType || selectedType === 'video' || selectedType === 'pdf';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "ערוך פריט" : "הוסף פריט חדש"}</DialogTitle>
          <DialogDescription>
            הוסף פריט חדש לספריית התוכן שלך
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">כותרת</Label>
            <Input
              id="title"
              placeholder="הזן כותרת"
              {...register("title", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">סוג פריט</Label>
            <Select
              onValueChange={handleTypeChange}
              defaultValue={selectedType}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג פריט" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">הערה</SelectItem>
                <SelectItem value="link">קישור</SelectItem>
                <SelectItem value="image">תמונה</SelectItem>
                <SelectItem value="image_album">אלבום תמונות</SelectItem>
                <SelectItem value="video">וידאו</SelectItem>
                <SelectItem value="whatsapp">וואטסאפ</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="question">שאלה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">תוכן</Label>
            <Textarea
              id="content"
              placeholder={selectedType === 'question' ? "מה השאלה שלך?" : "תוכן"}
              {...register("content", { required: true })}
            />
          </div>

          {isFileUploadType && (
            <div className="space-y-2">
              <Label>
                {selectedType === 'image' ? 'העלה תמונה' : 
                 selectedType === 'image_album' ? 'העלה תמונות' :
                 selectedType === 'video' ? 'העלה וידאו' : 'העלה PDF'}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept={
                    isImageType
                      ? "image/*" 
                      : selectedType === 'video'
                      ? "video/*" 
                      : "application/pdf"
                  }
                  multiple={selectedType === 'image_album'}
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {selectedFiles && (
                  <span className="text-sm text-gray-500">
                    {selectedFiles.length} {selectedFiles.length === 1 ? 'קובץ' : 'קבצים'} נבחרו
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
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