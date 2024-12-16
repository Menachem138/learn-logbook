import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  videoTitle: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  videoTitle,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent data-testid="delete-confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="delete-dialog-title">מחיקת סרטון</AlertDialogTitle>
          <AlertDialogDescription data-testid="delete-dialog-description">
            האם אתה בטוח שברצונך למחוק את הסרטון "{videoTitle}"?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="delete-dialog-cancel" onClick={onClose}>ביטול</AlertDialogCancel>
          <AlertDialogAction data-testid="delete-dialog-confirm" onClick={onConfirm}>מחק</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
