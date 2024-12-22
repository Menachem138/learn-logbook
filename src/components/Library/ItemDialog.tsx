import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { LibraryItem, LibraryItemType } from "@/types/library";
import { Upload } from "lucide-react";

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<LibraryItem> & { files?: File[] }) => void;
  initialData?: LibraryItem | null;
  defaultType?: LibraryItemType;
}

export function ItemDialog({ isOpen, onClose, onSubmit, initialData, defaultType }: ItemDialogProps) {
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: initialData || {
      title: "",
      content: "",
      type: defaultType || "note" as LibraryItemType,
    },
  });

  const selectedType = watch("type");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);

  const onSubmitForm = (data: any) => {
    const formData = {
      ...data,
      files: selectedType === 'image_album' ? selectedFiles : selectedFiles.slice(0, 1),
    };
    onSubmit(formData);
    setSelectedFiles([]);
    reset();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles(files);
    }
  };

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
              <option value="image_album">אלבום תמונות</option>
              <option value="video">וידאו</option>
              <option value="whatsapp">וואטסאפ</option>
              <option value="pdf">PDF</option>
              <option value="question">שאלה</option>
              <option value="image_album">אלבום תמונות</option>
            </select>
          </div>
          <div>
            <Textarea
              placeholder={selectedType === 'question' ? "מה השאלה שלך?" : "תוכן"}
              {...register("content", { required: true })}
            />
          </div>

          {(selectedType === 'image' || selectedType === 'video' || selectedType === 'pdf' || selectedType === 'image_album') && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {selectedType === 'image' ? 'העלה תמונה' : 
                 selectedType === 'video' ? 'העלה וידאו' : 
                 selectedType === 'image_album' ? 'העלה תמונות' :
                 'העלה PDF'}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept={
                    selectedType === 'image' || selectedType === 'image_album'
                      ? "image/*" 
                      : selectedType === 'video' 
                      ? "video/*" 
                      : "application/pdf"
                  }
                  multiple={selectedType === 'image_album'}
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {selectedFiles.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {selectedType === 'image_album' 
                      ? `${selectedFiles.length} files selected`
                      : selectedFiles[0].name}
                  </span>
                )}
              </div>
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
