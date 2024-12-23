import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { CardHeader } from "./CardHeader";
import { ImageGalleryGrid } from "./ImageGalleryGrid";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "image_gallery";
  src: string | string[];
  title: string;
  content?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onStar?: () => void;
  isStarred?: boolean;
}

export function MediaCard({ 
  type, 
  src, 
  title,
  content, 
  onEdit, 
  onDelete, 
  onStar, 
  isStarred 
}: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
    if (type === "image" || type === "video" || type === "image_gallery") {
      setIsViewerOpen(true);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <CardHeader
          title={title}
          content={content}
          isStarred={isStarred}
          onStar={onStar}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        
        {type === "image_gallery" && Array.isArray(src) ? (
          <ImageGalleryGrid
            images={src}
            title={title}
            onImageClick={handleMediaClick}
          />
        ) : (
          <div 
            className="cursor-pointer group relative aspect-video"
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
        )}
      </Card>

      {(type === "image" || type === "video" || type === "image_gallery") && (
        <MediaViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          type={type}
          src={type === "image_gallery" ? src : (typeof src === 'string' ? src : src[0])}
          title={title}
          selectedIndex={selectedImageIndex}
          onImageChange={setSelectedImageIndex}
        />
      )}
    </>
  );
}