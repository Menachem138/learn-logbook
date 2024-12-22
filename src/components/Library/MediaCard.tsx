import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { MultiImageGallery } from "./MultiImageGallery";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "image_album";
  src: string | string[];
  title: string;
}

export function MediaCard({ type, src, title }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  if (type === "image_album" && Array.isArray(src)) {
    return <MultiImageGallery images={src} />;
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
    if ((type === "image" && !Array.isArray(src)) || type === "video") {
      setIsViewerOpen(true);
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer group relative"
        onClick={handleMediaClick}
      >
        {type === "image" ? (
          <img 
            src={src} 
            alt={title} 
            className="w-full h-auto transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : type === "video" ? (
          <video controls className="w-full h-auto">
            <source src={src} type="video/mp4" />
            הדפדפן שלך לא תומך בתגית וידאו.
          </video>
        ) : null}
      </Card>

      {((type === "image" && !Array.isArray(src)) || type === "video") && (
        <MediaViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          type={type as "image" | "video"}
          src={src as string}
          title={title}
        />
      )}
    </>
  );
}
