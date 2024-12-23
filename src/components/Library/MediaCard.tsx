import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Star, Trash2, Edit2 } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "image_gallery";
  src: string | string[];
  title: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onStar?: () => void;
  isStarred?: boolean;
}

export function MediaCard({ type, src, title, onEdit, onDelete, onStar, isStarred }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
    const displayedImages = src.slice(0, 4);
    const remainingCount = src.length - 4;

    return (
      <>
        <Card className="overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">{title}</h3>
            <div className="flex gap-2">
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
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {displayedImages.map((imgSrc, index) => (
                <div 
                  key={index} 
                  className="relative aspect-square cursor-pointer group"
                  onClick={handleMediaClick}
                >
                  {index === 3 && remainingCount > 0 ? (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">+{remainingCount}</span>
                    </div>
                  ) : null}
                  <img 
                    src={imgSrc} 
                    alt={`${title} ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg transition-all duration-200 group-hover:scale-[1.02]"
                    loading="lazy"
                    onError={(e) => {
                      console.error("Image failed to load:", imgSrc);
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
              ))}
            </div>
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
      <Card className="overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">{title}</h3>
          <div className="flex gap-2">
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