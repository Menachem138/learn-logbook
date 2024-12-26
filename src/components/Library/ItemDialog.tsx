import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { LibraryItem, LibraryItemType } from "@/types/library";

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<LibraryItem> & { files?: FileList }) => void;
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
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const onSubmitForm = (data: any) => {
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
    if (files) {
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
            </select>
          </div>
          <div>
            <Textarea
              placeholder={selectedType === 'question' ? "מה השאלה שלך?" : "תוכן"}
              {...register("content", { required: true })}
            />
          </div>

          {(selectedType === 'image' || selectedType === 'image_album' || selectedType === 'video' || selectedType === 'pdf') && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {selectedType === 'image_album' ? 'העלה תמונות לאלבום' : 
                 selectedType === 'image' ? 'העלה תמונה' : 
                 selectedType === 'video' ? 'העלה וידאו' : 'העלה PDF'}
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
                {selectedFiles && (
                  <span className="text-sm text-gray-500">
                    {selectedFiles.length} {selectedType === 'image_album' ? 'קבצים נבחרו' : 'קובץ נבחר'}
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