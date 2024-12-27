import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { supabase } from "@/integrations/supabase/client";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "image_gallery";
  src: string | string[];
  title: string;
  onDeleteImage?: (index: number) => void;
}

export function MediaCard({ type, src, title, onDeleteImage }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  console.log("MediaCard props:", { type, src, title });

  const getSignedUrl = async (path: string) => {
    // If it's a Cloudinary URL, return it directly
    if (path.includes('cloudinary.com')) {
      return path;
    }

    try {
      const { data: { signedUrl }, error } = await supabase.storage
        .from('content_library')
        .createSignedUrl(path, 60 * 60); // 1 hour expiry

      if (error) {
        console.error("Error getting signed URL:", error);
        return path;
      }

      return signedUrl;
    } catch (error) {
      console.error("Error in getSignedUrl:", error);
      return path;
    }
  };

  if (type === "pdf") {
    return (
      <Card className="p-4 flex items-center gap-2">
        <FileText className="w-6 h-6 text-red-500" />
        <button 
          onClick={async () => {
            const filePath = typeof src === 'string' ? src : src[0];
            const signedUrl = await getSignedUrl(filePath);
            window.open(signedUrl, '_blank');
          }}
          className="text-blue-500 hover:underline"
        >
          {title}
        </button>
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
        <div 
          className="cursor-pointer group relative"
          onClick={handleMediaClick}
        >
          <div className="grid grid-cols-2 gap-0.5 aspect-square">
            {src.slice(0, 4).map((imgSrc, index) => (
              <div key={index} className="relative">
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
        </div>

        <MediaViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          type="image_gallery"
          src={src}
          title={title}
          selectedIndex={selectedImageIndex}
          onImageChange={setSelectedImageIndex}
          onDeleteImage={onDeleteImage}
        />
      </>
    );
  }

  return (
    <>
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