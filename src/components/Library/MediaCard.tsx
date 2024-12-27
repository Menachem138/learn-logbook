import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { PDFViewer } from "./PDFViewer";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "image_gallery";
  src: string | string[];
  title: string;
  originalName?: string;
  onDeleteImage?: (index: number) => void;
}

export function MediaCard({ type, src, title, originalName, onDeleteImage }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  console.log("MediaCard props:", { type, src, title, originalName });

  if (type === "pdf") {
    return (
      <>
        <Card 
          className="p-4 flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsViewerOpen(true)}
        >
          <FileText className="w-6 h-6 text-red-500" />
          <span className="text-blue-500 hover:underline">{title}</span>
        </Card>
        
        <PDFViewer
          url={typeof src === 'string' ? src : src[0]}
          title={title}
          originalName={originalName}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        />
      </>
    );
  }

  if (type === "image" || type === "video" || type === "image_gallery") {
    return (
      <>
        <Card className="p-4 flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsViewerOpen(true)}>
          {type === "image" ? (
            <img src={typeof src === 'string' ? src : src[0]} alt={title} className="w-16 h-16 object-cover" />
          ) : (
            <FileText className="w-6 h-6 text-blue-500" />
          )}
          <span className="text-blue-500 hover:underline">{title}</span>
        </Card>

        {type === "image_gallery" && (
          <MediaViewer
            isOpen={isViewerOpen}
            onClose={() => setIsViewerOpen(false)}
            type={type}
            src={src}
            title={title}
            selectedIndex={selectedImageIndex}
            onImageChange={setSelectedImageIndex}
            onDeleteImage={onDeleteImage}
          />
        )}
      </>
    );
  }

  return null;
}
