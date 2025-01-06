import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Editor from "../Editor";

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

export function JournalDialogs({
  isEditing,
  setIsEditing,
  editingEntry,
  setEditingEntry,
  onUpdateEntry,
  showSummary,
  setShowSummary,
  summary,
  selectedImage,
  setSelectedImage
}: JournalDialogsProps) {
  return (
    <>
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl">
          {editingEntry && (
            <Editor
              content={editingEntry.content}
              onChange={(content) => {
                setEditingEntry({ ...editingEntry, content });
              }}
              onSave={async () => {
                if (editingEntry) {
                  const success = await onUpdateEntry(editingEntry);
                  if (success) {
                    setIsEditing(false);
                  }
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent>
          <div className="prose prose-sm dark:prose-invert">
            {summary}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <img src={selectedImage} alt="Selected" className="w-full h-auto" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}