import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { ImageAlbum } from "./ImageAlbum";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "image_gallery";
  src: string | string[];
  title: string;
}

export function MediaCard({ type, src, title }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  console.log('MediaCard rendered with:', { type, src, title });

  if (type === "pdf") {
    const pdfUrl = src as string;
    console.log('PDF URL:', pdfUrl);

    return (
      <Card className="p-4 flex items-center gap-2">
        <FileText className="w-6 h-6 text-red-500" />
        <a 
          href={pdfUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {title}
        </a>
      </Card>
    );
  }

  if (type === "image_gallery" && Array.isArray(src)) {
    console.log('Rendering image gallery with sources:', src);
    return <ImageAlbum images={src} title={title} />;
  }

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer group relative aspect-video"
        onClick={() => setIsViewerOpen(true)}
      >
        {type === "image" && (
          <img 
            src={src as string} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              console.error('Image failed to load:', src);
              const imgElement = e.target as HTMLImageElement;
              imgElement.style.display = 'none';
            }}
          />
        )}
        {type === "video" && (
          <video controls className="w-full h-full object-cover">
            <source src={src as string} type="video/mp4" />
            הדפדפן שלך לא תומך בתגית וידאו.
          </video>
        )}
      </Card>

      <MediaViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        type={type}
        src={src}
        title={title}
      />
    </>
  );
}