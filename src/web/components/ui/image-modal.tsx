import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function ImageModal({ isOpen, onClose, imageUrl }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Enlarged view" 
          className="w-full h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </DialogContent>
    </Dialog>
  );
}