import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Editor from "../Editor";
import { ImageModal } from "@/components/ui/image-modal";

interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  is_important: boolean;
  user_id: string;
}

interface JournalDialogsProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  editingEntry: JournalEntry | null;
  setEditingEntry: (entry: JournalEntry | null) => void;
  onUpdateEntry: (entry: JournalEntry) => Promise<boolean>;
  showSummary: boolean;
  setShowSummary: (value: boolean) => void;
  summary: string | null;
  selectedImage: string | null;
  setSelectedImage: (value: string | null) => void;
}

export const JournalDialogs: React.FC<JournalDialogsProps> = ({
  isEditing,
  setIsEditing,
  editingEntry,
  setEditingEntry,
  onUpdateEntry,
  showSummary,
  setShowSummary,
  summary,
  selectedImage,
  setSelectedImage,
}) => {
  return (
    <>
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="w-full max-w-4xl">
          <DialogHeader>
            <DialogTitle>ערוך רשומה</DialogTitle>
          </DialogHeader>
          <div className="w-full max-h-[60vh] overflow-y-auto">
            <Editor
              content={editingEntry?.content || ""}
              onChange={(content) => setEditingEntry(editingEntry ? { ...editingEntry, content } : null)}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => editingEntry && onUpdateEntry(editingEntry)}>
              שמור שינויים
            </Button>
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setEditingEntry(null);
            }}>
              ביטול
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>סיכום רשומה</DialogTitle>
          </DialogHeader>
          <div className="mt-4 whitespace-pre-wrap">
            {summary}
          </div>
          <Button 
            onClick={() => setShowSummary(false)} 
            className="mt-4"
          >
            סגור
          </Button>
        </DialogContent>
      </Dialog>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
      />
    </>
  );
};