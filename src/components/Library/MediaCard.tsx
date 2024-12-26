import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Music } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { ImageAlbumCard } from "./ImageAlbumCard";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "audio" | "image_album";
  src?: string | string[];
  title: string;
  cloudinaryData?: any;
  cloudinaryUrls?: string[];
  fileDetails?: {
    path?: string;
    paths?: string[];
  };
}

export function MediaCard({ type, src, title, cloudinaryData, cloudinaryUrls, fileDetails }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  console.log("MediaCard rendered with:", { type, src, title, cloudinaryData, cloudinaryUrls, fileDetails });

  // Determine the actual source to use
  const getMediaSource = () => {
    if (type === 'image_album') {
      if (cloudinaryUrls && cloudinaryUrls.length > 0) {
        return cloudinaryUrls;
      }
      if (fileDetails?.paths && fileDetails.paths.length > 0) {
        return fileDetails.paths;
      }
      return Array.isArray(src) ? src : [src].filter(Boolean);
    }

    // For single media items
    if (cloudinaryData?.secure_url) {
      return cloudinaryData.secure_url;
    }
    if (fileDetails?.path) {
      return fileDetails.path;
    }
    return src || '';
  };

  const mediaSource = getMediaSource();

  // Handle image albums separately using ImageAlbumCard
  if (type === "image_album") {
    const images = Array.isArray(mediaSource) ? mediaSource : [mediaSource].filter(Boolean);
    if (images.length === 0) {
      return null;
    }
    return <ImageAlbumCard images={images} title={title} />;
  }

  if (type === "pdf") {
    return (
      <Card className="p-4 flex items-center gap-2">
        <FileText className="w-6 h-6 text-red-500" />
        <a 
          href={mediaSource as string} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {title}
        </a>
      </Card>
    );
  }

  if (type === "audio") {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Music className="w-6 h-6 text-purple-500" />
          <span className="font-medium">{title}</span>
        </div>
        <audio controls className="w-full">
          <source src={mediaSource as string} type="audio/mpeg" />
          הדפדפן שלך לא תומך בתגית אודיו.
        </audio>
      </Card>
    );
  }

  const handleMediaClick = () => {
    if (type === "image" || type === "video") {
      setIsViewerOpen(true);
    }
  };

  if (!mediaSource) {
    return null;
  }

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer group relative"
        onClick={handleMediaClick}
      >
        {type === "image" ? (
          <img 
            src={mediaSource as string} 
            alt={title} 
            className="w-full h-auto transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : type === "video" ? (
          <video controls className="w-full h-auto">
            <source src={mediaSource as string} type="video/mp4" />
            הדפדפן שלך לא תומך בתגית וידאו.
          </video>
        ) : null}
      </Card>

      {(type === "image" || type === "video") && (
        <MediaViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          type={type}
          src={mediaSource as string}
          title={title}
        />
      )}
    </>
  );
}