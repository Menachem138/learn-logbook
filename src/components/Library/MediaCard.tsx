import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Trash2, Pencil, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaViewer } from "./MediaViewer";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "image_gallery";
  src: string | string[];
  title: string;
}

export function MediaCard({ type, src, title }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  console.log("MediaCard props:", { type, src, title });

  // Handle case where src might be in file_details.urls for backward compatibility
  const getSources = () => {
    if (Array.isArray(src)) return src;
    if (typeof src === 'object' && src !== null) {
      // @ts-ignore
      return src.urls || src.path || [];
    }
    return [src];
  };

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

  if (type === "image_gallery") {
    const sources = getSources();
    console.log("Rendering image gallery with sources:", sources);
    return (
      <>
        <Card className="overflow-hidden bg-white">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <div className="flex gap-2">
              <Button size="icon" variant="ghost">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost">
                <Star className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">{title}</span>
          </div>
          
          <div 
            className="cursor-pointer group"
            onClick={handleMediaClick}
          >
            <div className="grid grid-cols-2 gap-0.5">
              {sources.slice(0, 4).map((imgSrc, index) => (
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
                  {index === 3 && sources.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">+{sources.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-right">{title}</p>
          </div>
        </Card>

        <MediaViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          type="image_gallery"
          src={sources}
          title={title}
          selectedIndex={selectedImageIndex}
          onImageChange={setSelectedImageIndex}
        />
      </>
    );
  }

  return (
    <>
      <div 
        className="cursor-pointer group relative w-full h-full"
        onClick={handleMediaClick}
      >
        {type === "image" ? (
          <img 
            src={typeof src === 'string' ? src : src[0]} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              console.error("Image failed to load:", src);
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        ) : type === "video" ? (
          <video controls className="w-full h-full object-cover">
            <source src={typeof src === 'string' ? src : src[0]} type="video/mp4" />
            הדפדפן שלך לא תומך בתגית וידאו.
          </video>
        ) : null}
      </div>

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
