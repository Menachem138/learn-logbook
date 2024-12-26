import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Music } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { ImageAlbum } from "./ImageAlbum";
import { MediaCardProps } from "./types";

export function MediaCard({ type, title, cloudinaryData, cloudinaryUrls, fileDetails }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  console.log("MediaCard - Rendering with props:", { type, title, cloudinaryData, cloudinaryUrls, fileDetails });
  
  const getMediaSource = () => {
    let source = null;
    
    // Check Cloudinary data first
    if (cloudinaryData?.secure_url) {
      console.log("Using Cloudinary URL:", cloudinaryData.secure_url);
      source = cloudinaryData.secure_url;
    }
    // Then check Cloudinary URLs array for albums
    else if (type === 'image_album' && Array.isArray(cloudinaryUrls) && cloudinaryUrls.length > 0) {
      console.log("Using Cloudinary URLs array:", cloudinaryUrls);
      source = cloudinaryUrls;
    }
    // Finally check file details
    else if (fileDetails?.path) {
      console.log("Using file details path:", fileDetails.path);
      source = fileDetails.path;
    }
    else if (fileDetails?.paths && fileDetails.paths.length > 0) {
      console.log("Using file details paths array:", fileDetails.paths);
      source = fileDetails.paths;
    }

    console.log("Final media source:", source);
    return source;
  };

  const mediaSource = getMediaSource();

  if (!mediaSource) {
    console.log("No valid media source found for:", title);
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
        {type === "image" && (
          <div className="relative w-full h-48">
            <img 
              src={mediaSource as string}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                console.error("Error loading image:", mediaSource);
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>
        )}
        
        {type === "video" && (
          <video 
            src={mediaSource as string}
            className="w-full h-48 object-cover"
            controls
          >
            הדפדפן שלך לא תומך בתגית וידאו.
          </video>
        )}
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