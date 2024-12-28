import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { DocumentInput } from '@/types/documents';
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2 } from "lucide-react";

interface AddDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentInput) => void;
}

export function AddDocumentDialog({ isOpen, onClose, onSubmit }: AddDocumentDialogProps) {
  const { register, handleSubmit, watch, reset } = useForm<DocumentInput>();
  const [file, setFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const selectedType = watch('type');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
  });

  const handleFormSubmit = async (data: DocumentInput) => {
    if (!file) {
      toast({
        title: "שגיאה",
        description: "נא להעלות קובץ",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({ ...data, file });
      reset();
      setFile(null);
      onClose();
      toast({
        title: "הצלחה",
        description: "המסמך נוסף בהצלחה",
      });
    } catch (error) {
      console.error('Error submitting document:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת המסמך",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
      reset();
      setFile(null);
      setIsSubmitting(false);
    }
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הוסף מסמך חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <select
              className="w-full p-2 border rounded-md"
              {...register("type", { required: true })}
            >
              <option value="">בחר סוג מסמך</option>
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
              <option value="md">Markdown</option>
            </select>
          </div>
          
          <div>
            <Input
              placeholder="כותרת"
              {...register("title", { required: true })}
            />
          </div>

          <div>
            <Textarea
              placeholder="תיאור (אופציונלי)"
              {...register("description")}
            />
          </div>

          <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary">
            <input {...getInputProps()} />
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p>גרור קובץ לכאן או לחץ לבחירת קובץ</p>
            {selectedType && (
              <p className="text-sm text-muted-foreground">
                {selectedType === 'pdf' ? 'קובץ PDF' : 
                 selectedType === 'word' ? 'מסמך Word' : 
                 'קובץ Markdown'}
              </p>
            )}
          </div>

          {file && (
            <div className="p-2 bg-muted rounded flex items-center justify-between">
              <span className="text-sm">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
              >
                הסר
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  מוסיף...
                </>
              ) : (
                'הוסף'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}