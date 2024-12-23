import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { MediaViewer } from "./MediaViewer";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "image_gallery";
  src: string | string[];
  title: string;
}

export function MediaCard({ type, src, title }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Add debug logging
  console.log("MediaCard props:", { type, src, title });

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
    console.log("Media clicked:", { type, isViewerOpen });
    if (type === "image" || type === "video" || type === "image_gallery") {
      setIsViewerOpen(true);
    }
  };

  if (type === "image_gallery" && Array.isArray(src)) {
    console.log("Rendering image gallery with sources:", src);
    return (
      <>
        <Card 
          className="overflow-hidden cursor-pointer group"
          onClick={handleMediaClick}
        >
          <div className="grid grid-cols-2 gap-0.5">
            {src.slice(0, 4).map((imgSrc, index) => (
              <div key={index} className="relative aspect-square">
                <img 
                  src={imgSrc} 
                  alt={`${title} ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    console.error("Image failed to load:", imgSrc);
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                {index === 3 && src.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">+{src.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <MediaViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          type="image_gallery"
          src={src}
          title={title}
          selectedIndex={selectedImageIndex}
          onImageChange={setSelectedImageIndex}
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
            onError={(e) => {
              console.error("Image failed to load:", src);
              e.currentTarget.src = "/placeholder.svg";
            }}
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
          src={typeof src === 'string' ? src : src[0]}
          title={title}
        />
      )}
    </>
  );
}