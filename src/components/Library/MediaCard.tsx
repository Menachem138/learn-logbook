import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { YouTubePlayer } from "./YouTubePlayer";
import { extractYouTubeId } from "@/utils/youtube";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "youtube";
  src: string;
  title: string;
  onClick?: () => void;
}

export function MediaCard({ type, src, title, onClick }: MediaCardProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  if (type === "pdf") {
    return (
      <Card className="p-4 flex items-center gap-2">
        <FileText className="w-6 h-6 text-red-500" />
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {title}
        </a>
      </Card>
    );
  }

  if (type === "youtube") {
    const videoId = extractYouTubeId(src);
    if (!videoId) return null;

    return (
      <>
        <Card
          className="overflow-hidden cursor-pointer"
          onClick={() => setIsVideoOpen(true)}
        >
          <div className="relative">
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={title}
              className="w-full h-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[16px] border-l-white border-b-8 border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium line-clamp-2">{title}</h3>
          </div>
        </Card>
        <YouTubePlayer
          videoId={videoId}
          isOpen={isVideoOpen}
          onClose={() => setIsVideoOpen(false)}
        />
      </>
    );
  }

  if (type === "image") {
    return (
      <Card className="overflow-hidden">
        <img src={src} alt={title} className="w-full h-auto" />
      </Card>
    );
  }

  if (type === "video") {
    return (
      <Card className="overflow-hidden">
        <video controls className="w-full h-auto">
          <source src={src} type="video/mp4" />
          הדפדפן שלך לא תומך בתגית וידאו.
        </video>
      </Card>
    );
  }

  return null;
}
