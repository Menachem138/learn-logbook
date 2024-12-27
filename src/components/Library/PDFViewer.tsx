import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink } from "lucide-react";

interface PDFViewerProps {
  url: string;
  title: string;
  originalName?: string;
  onClose: () => void;
  isOpen: boolean;
}

export const PDFViewer = ({ url, title, originalName, onClose, isOpen }: PDFViewerProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(url, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              פתח בחלון חדש
            </Button>
            <a
              href={url}
              download={originalName || title}
              className="inline-flex"
            >
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                הורד
              </Button>
            </a>
          </div>
        </div>
        <iframe
          src={url}
          className="w-full h-full rounded-lg"
          title={title}
        />
      </DialogContent>
    </Dialog>
  );
};