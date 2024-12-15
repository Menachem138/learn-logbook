import { Card } from "@/components/ui/card";
import { FileText, Play } from "lucide-react";
import { getYouTubeThumbnail, getYouTubeVideoId } from "@/utils/youtube";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "youtube";
  src: string;
  title: string;
  onClick?: () => void;
}

export function MediaCard({ type, src, title, onClick }: MediaCardProps) {
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

  if (type === "image") {
    return (
      <Card className="overflow-hidden" onClick={onClick}>
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

  if (type === "youtube") {
    const videoId = getYouTubeVideoId(src) || src;
    const thumbnailUrl = getYouTubeThumbnail(videoId);

    return (
      <Card className="overflow-hidden relative group cursor-pointer" onClick={onClick}>
        <div className="aspect-video relative">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load YouTube thumbnail:', thumbnailUrl);
              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all" />
            <span className="text-white text-sm mt-2 px-2 text-center opacity-0 group-hover:opacity-100 transition-all">{title}</span>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}
