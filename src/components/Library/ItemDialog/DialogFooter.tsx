import React from "react";
import { Button } from "@/components/ui/button";

interface DialogFooterProps {
  onClose: () => void;
  initialData: any;
}

export function DialogFooter({ onClose, initialData }: DialogFooterProps) {
  return (
    <div className="sticky bottom-0 bg-background pt-2 border-t mt-4">
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          ביטול
        </Button>
        <Button type="submit">
          {initialData ? "עדכן" : "הוסף"}
        </Button>
      </div>
    </div>
  );
}