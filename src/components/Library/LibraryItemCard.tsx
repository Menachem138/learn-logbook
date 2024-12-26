import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Edit2 } from "lucide-react";
import { MediaCard } from "./MediaCard";
import { LibraryItem } from "./types";

interface LibraryItemCardProps {
  item: LibraryItem;
  onDelete: (id: string) => void;
  onEdit: (item: LibraryItem) => void;
  onToggleStar: (id: string, isStarred: boolean) => void;
}

export function LibraryItemCard({ item, onDelete, onEdit, onToggleStar }: LibraryItemCardProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold">{item.title}</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleStar(item.id, !item.is_starred)}
            className="hover:text-yellow-400"
          >
            <Star className={`w-4 h-4 ${item.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(item)}
            className="hover:text-blue-500"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            className="hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{item.content}</p>
      
      {(item.type === 'image' || item.type === 'video' || item.type === 'pdf' || 
        item.type === 'audio' || item.type === 'image_album') && (
        <div className="mt-2">
          <MediaCard
            type={item.type}
            title={item.title}
            cloudinaryData={item.cloudinary_data}
            cloudinaryUrls={item.cloudinary_urls}
            fileDetails={item.file_details}
          />
        </div>
      )}
    </Card>
  );
}