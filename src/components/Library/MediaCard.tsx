import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Star, Trash2 } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { LibraryItem } from "@/types/library";

interface MediaCardProps {
  item: LibraryItem;
  onEdit: (item: LibraryItem) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string, isStarred: boolean) => void;
}

export function MediaCard({ item, onEdit, onDelete, onToggleStar }: MediaCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStar(item.id, !item.is_starred);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(item);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  const getMediaType = () => {
    if (item.type === 'video') return 'video';
    if (item.type === 'gallery') return 'gallery';
    return 'image';
  };

  const getMediaSrc = () => {
    if (item.file_details?.path) {
      return Array.isArray(item.file_details.path) 
        ? item.file_details.path 
        : [item.file_details.path];
    }
    return [];
  };

  const renderPreview = () => {
    const paths = getMediaSrc();
    if (paths.length === 0) return null;

    if (item.type === 'gallery') {
      return (
        <div className="grid grid-cols-2 gap-1 aspect-square">
          {paths.slice(0, 4).map((path, index) => (
            <div key={index} className="relative">
              <img
                src={path}
                alt={`${item.title} - ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 3 && paths.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                  +{paths.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <img
        src={paths[0]}
        alt={item.title}
        className="w-full h-48 object-cover"
      />
    );
  };

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setIsViewerOpen(true)}
      >
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderPreview()}
          <p className="mt-2">{item.content}</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStarClick}
            className={item.is_starred ? "text-yellow-500" : ""}
          >
            <Star className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <MediaViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        type={getMediaType()}
        src={getMediaSrc()}
        title={item.title}
      />
    </>
  );
}