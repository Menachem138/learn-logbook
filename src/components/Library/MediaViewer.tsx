import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "image" | "video" | "pdf";
  src: string;
  title: string;
}

export function MediaViewer({ isOpen, onClose, type, src, title }: MediaViewerProps) {
  if (type === "pdf") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <iframe
            src={src}
            title={title}
            className="w-full h-full"
            style={{ border: "none" }}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        {type === "video" ? (
          <video src={src} controls className="w-full" />
        ) : (
          <img src={src} alt={title} className="w-full h-auto" />
        )}
      </DialogContent>
    </Dialog>
  );
}