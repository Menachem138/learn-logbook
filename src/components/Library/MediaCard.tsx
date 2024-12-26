import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Music } from "lucide-react";
import { MediaViewer } from "./MediaViewer";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "audio" | "image_album";
  title: string;
  cloudinaryData?: any;
  cloudinaryUrls?: string[];
  fileDetails?: {
    path?: string;
    paths?: string[];
    name?: string;
    type?: string;
  };
}

export function MediaCard({ type, title, cloudinaryData, cloudinaryUrls, fileDetails }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  console.log("MediaCard rendered with:", { type, title, cloudinaryData, cloudinaryUrls, fileDetails });

  // Get the actual media source
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
  console.log("Media source determined:", mediaSource);

  if (!mediaSource) {
    console.log("No media source found for:", title);
    return null;
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