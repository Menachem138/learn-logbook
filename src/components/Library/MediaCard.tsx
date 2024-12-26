import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { ImageAlbumCard } from "./ImageAlbumCard";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "image_album";
  src?: string;
  title: string;
  itemId: string;
  cloudinaryUrls?: Array<{ url: string; publicId: string }>;
  onUpdate?: () => void;
}

export function MediaCard({ 
  type, 
  src, 
  title, 
  itemId,
  cloudinaryUrls = [],
  onUpdate = () => {} 
}: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  if (type === "image_album") {
    return (
      <ImageAlbumCard
        images={cloudinaryUrls}
        title={title}
        itemId={itemId}
        onUpdate={onUpdate}
      />
    );
  }

  if (type === "pdf") {
    return (
      <Card className="p-4 flex items-center gap-2">
        <FileText className="w-6 h-6 text-red-500" />
        <a 
          href={src} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {title}
        </a>
      </Card>
    );
  }

  const handleMediaClick = () => {
    if (type === "image" || type === "video") {
      setIsViewerOpen(true);
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer"
        onClick={handleMediaClick}
      >
        {type === "image" ? (
          <img 
            src={src} 
            alt={title} 
            className="w-full h-auto"
            loading="lazy"
          />
        ) : type === "video" ? (
          <video controls className="w-full h-auto">
            <source src={src} type="video/mp4" />
            הדפדפן שלך לא תומך בתגית וידאו.
          </video>
        ) : null}
      </Card>

      {(type === "image" || type === "video") && (
        <MediaViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          type={type}
          src={src || ''}
          title={title}
        />
      )}
    </>
  );
}