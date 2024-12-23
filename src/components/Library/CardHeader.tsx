import { Button } from "@/components/ui/button";
import { Star, Edit2, Trash2 } from "lucide-react";

interface CardHeaderProps {
  title: string;
  content?: string;
  isStarred?: boolean;
  onStar?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CardHeader({ 
  title, 
  content,
  isStarred, 
  onStar, 
  onEdit, 
  onDelete 
}: CardHeaderProps) {
  return (
    <div className="p-4 space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="flex gap-2">
          {onStar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onStar();
              }}
              className="hover:text-yellow-400"
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="hover:text-blue-500"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      {content && <p className="text-sm text-gray-600">{content}</p>}
    </div>
  );
}