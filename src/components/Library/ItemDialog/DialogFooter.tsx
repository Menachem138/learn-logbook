import React from "react";
import { Button } from "@/components/ui/button";

interface DialogFooterProps {
  onClose: () => void;
  initialData: any;
}

export function DialogFooter({ onClose, initialData }: DialogFooterProps) {
  return (
    <div className="sticky bottom-0 bg-background py-4 px-6 border-t mt-auto">
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