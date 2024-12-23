import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Star, Edit2, Trash2 } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { Button } from "@/components/ui/button";
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
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-lg">{title}</h3>
              {content && <p className="text-sm text-gray-600">{content}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              {onStar && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStar();
                  }}
                  className="hover:text-yellow-400"
                >
                  <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="hover:text-blue-500"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {type === "image_gallery" && Array.isArray(src) ? (
          <ImageGalleryGrid
            images={src}
            title={title}
            onImageClick={handleMediaClick}
          />
        ) : (
          <div 
            className="cursor-pointer group relative"
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