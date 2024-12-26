import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Music } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { ImageAlbum } from "./ImageAlbum";
import { MediaCardProps } from "./types";

export function MediaCard({ type, title, cloudinaryData, cloudinaryUrls, fileDetails }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const getMediaSource = () => {
    if (type === 'image_album' && cloudinaryUrls && cloudinaryUrls.length > 0) {
      return cloudinaryUrls;
    }
    
    if (cloudinaryData?.secure_url) {
      return cloudinaryData.secure_url;
    }

    if (fileDetails?.path) {
      return fileDetails.path;
    }

    if (fileDetails?.paths && fileDetails.paths.length > 0) {
      return fileDetails.paths;
    }

    return null;
  };

  const mediaSource = getMediaSource();

  if (!mediaSource) {
    return null;
  }

  if (type === "image_album") {
    return <ImageAlbum images={mediaSource as string[]} title={title} />;
  }

  if (type === "pdf") {
    return (
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-red-500" />
          <a 
            href={mediaSource as string}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {title}
          </a>
        </div>
      </Card>
    );
  }

  if (type === "audio") {
    return (
      <Card className="p-4 hover:shadow-lg transition-shadow">
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

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
        onClick={handleMediaClick}
      >
        {type === "image" ? (
          <img 
            src={mediaSource as string}
            alt={title}
            className="w-full h-48 object-cover"
            loading="lazy"
            onError={(e) => {
              console.error("Error loading image:", mediaSource);
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        ) : type === "video" ? (
          <video 
            src={mediaSource as string}
            className="w-full h-48 object-cover"
            controls
          >
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