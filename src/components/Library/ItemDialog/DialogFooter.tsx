import React from "react";
import { Button } from "@/components/ui/button";

interface DialogFooterProps {
  onClose: () => void;
  isEditing: boolean;
}

export function DialogFooter({ onClose, isEditing }: DialogFooterProps) {
  return (
    <div className="flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-gray-950 py-2 border-t">
      <Button type="button" variant="outline" onClick={onClose}>
        ביטול
      </Button>
      <Button type="submit">
        {isEditing ? "עדכן" : "הוסף"}
      </Button>
    </div>
  );
}