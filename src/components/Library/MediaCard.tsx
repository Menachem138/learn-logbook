import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { ImageAlbum } from "./ImageAlbum";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "image_album";
  src: string | string[];
  title: string;
}

export function MediaCard({ type, src, title }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);

  // Add logging to help debug the src URL
  console.log('MediaCard rendered with:', { type, src, title });

  if (type === "pdf") {
    // For PDFs, use the URL directly if it's from Supabase storage or Cloudinary
    const pdfUrl = src.includes('supabase.co') || src.includes('cloudinary.com') 
      ? src as string
      : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload/${src}`;
    
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

  if (type === "image_album" && Array.isArray(src)) {
    console.log('Rendering image album with sources:', src);
    return <ImageAlbum images={src} title={title} />;
  }

  const handleMediaClick = () => {
    if (type === "image" || type === "video") {
      setIsViewerOpen(true);
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer group relative"
        onClick={handleMediaClick}
      >
        {type === "image" ? (
          <img 
            src={src as string} 
            alt={title} 
            className="w-full h-auto transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : type === "video" ? (
          <video controls className="w-full h-auto">
            <source src={src as string} type="video/mp4" />
            הדפדפן שלך לא תומך בתגית וידאו.
          </video>
        ) : null}
      </Card>

      {(type === "image" || type === "video") && (
        <MediaViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          type={type}
          src={src as string}
          title={title}
        />
      )}
    </>
  );
}