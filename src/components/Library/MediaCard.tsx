import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { MediaViewer } from "./MediaViewer";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "gallery";
  src: string | string[];
  title: string;
}

export function MediaCard({ type, src, title }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  if (type === "pdf") {
    return (
      <Card className="p-4 flex items-center gap-2">
        <FileText className="w-6 h-6 text-red-500" />
        <a 
          href={typeof src === 'string' ? src : src[0]} 
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
    if (type === "image" || type === "video" || type === "gallery") {
      setIsViewerOpen(true);
    }
  };

  const renderImageGalleryPreview = () => {
    const images = Array.isArray(src) ? src : [src];
    const displayImages = images.slice(0, 4);
    const remainingCount = images.length - 4;

    return (
      <div className="grid grid-cols-2 gap-1 aspect-square">
        {displayImages.map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image}
              alt={`${title} - ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {index === 3 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-lg font-bold">+{remainingCount}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer group relative"
        onClick={handleMediaClick}
      >
        {(type === "image" || type === "gallery") ? (
          Array.isArray(src) ? (
            renderImageGalleryPreview()
          ) : (
            <img 
              src={src} 
              alt={title} 
              className="w-full h-auto transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          )
        ) : type === "video" ? (
          <video controls className="w-full h-auto">
            <source src={typeof src === 'string' ? src : src[0]} type="video/mp4" />
            הדפדפן שלך לא תומך בתגית וידאו.
          </video>
        ) : null}
      </Card>

      {(type === "image" || type === "video" || type === "gallery") && (
        <MediaViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          type={type}
          src={src}
          title={title}
        />
      )}
    </>
  );
}