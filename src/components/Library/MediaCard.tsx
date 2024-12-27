import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MediaViewer } from "./MediaViewer";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CLOUDINARY_CLOUD_NAME } from "@/integrations/cloudinary/client";

interface MediaCardProps {
  type: "image" | "video" | "image_gallery" | "pdf";
  src: string | string[];
  title: string;
  onDeleteImage?: (index: number) => void;
}

export function MediaCard({ type, src, title, onDeleteImage }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  console.log("MediaCard props:", { type, src, title });

  const handleMediaClick = () => {
    console.log("Media clicked:", { type, isViewerOpen });
    setIsViewerOpen(true);
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

  if (type === "pdf") {
    const pdfUrl = typeof src === 'string' ? src : src[0];
    const isCloudinaryUrl = pdfUrl.includes('cloudinary');
    
    const handlePdfClick = async () => {
      try {
        if (isCloudinaryUrl) {
          // Extract the public ID and version from the URL
          const urlParts = pdfUrl.split('/upload/');
          if (urlParts.length !== 2) {
            console.error("Invalid Cloudinary URL format");
            return;
          }
          
          // Create a direct download URL with fl_attachment
          const downloadUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/fl_attachment/${urlParts[1]}`;
          console.log("Opening PDF with URL:", downloadUrl);
          window.open(downloadUrl, '_blank');
        } else {
          // For Supabase URLs, open directly
          window.open(pdfUrl, '_blank');
        }
      } catch (error) {
        console.error("Error handling PDF:", error);
      }
    };
    
    return (
      <div 
        className="cursor-pointer group relative aspect-video bg-gray-100 flex items-center justify-center"
        onClick={handlePdfClick}
      >
        <FileText className="w-12 h-12 text-gray-400" />
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
          <p className="text-white text-sm truncate">{title}</p>
        </div>
      </div>
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