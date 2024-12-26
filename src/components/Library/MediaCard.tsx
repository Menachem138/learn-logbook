import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { MediaViewer } from "./MediaViewer";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "image_album";
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
          href={typeof src === 'string' ? src : '#'} 
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
    if (type === "image" || type === "video" || type === "image_album") {
      setIsViewerOpen(true);
    }
  };

  const images = Array.isArray(src) ? src : [src];
  const displayImages = images.slice(0, 4);
  const remainingCount = images.length - 4;

  if (type === "image_album") {
    return (
      <>
        <Card className="overflow-hidden cursor-pointer">
          <div className="grid grid-cols-2 gap-2 p-2">
            {displayImages.map((url, index) => (
              <div 
                key={index} 
                className="relative aspect-square"
                onClick={handleMediaClick}
              >
                <img
                  src={url}
                  alt={`${title} - תמונה ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
                {index === 3 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-bold rounded">
                    +{remainingCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <MediaViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          type="image"
          src={src}
          title={title}
        />
      </>
    );
  }

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer group relative"
        onClick={handleMediaClick}
      >
        {type === "image" ? (
          <img 
            src={typeof src === 'string' ? src : src[0]} 
            alt={title} 
            className="w-full h-auto transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : type === "video" ? (
          <video controls className="w-full h-auto">
            <source src={typeof src === 'string' ? src : src[0]} type="video/mp4" />
            הדפדפן שלך לא תומך בתגית וידאו.
          </video>
        ) : null}
      </Card>

      {(type === "image" || type === "video") && (
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