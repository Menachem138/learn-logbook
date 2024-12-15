import { Card } from "@/components/ui/card";
import { FileText, PlayCircle } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { getYouTubeVideoId, getYouTubeThumbnail } from "@/utils/youtube";

interface MediaCardProps {
  type: "image" | "video" | "pdf" | "youtube";
  src: string;
  title: string;
  id?: string;
  onView?: (id: string) => void;
}

export function MediaCard({ type, src, title, id, onView }: MediaCardProps) {
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

  if (type === "youtube") {
    const videoId = getYouTubeVideoId(src);
    if (!videoId) return null;

    return (
      <Card className="overflow-hidden group cursor-pointer" onClick={() => onView?.(id!)}>
        <div className="relative aspect-video">
          <img
            src={getYouTubeThumbnail(videoId)}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
            <PlayCircle className="w-12 h-12 text-white" />
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-sm truncate">{title}</h3>
        </CardContent>
      </Card>
    );
  }

  return null;
}
