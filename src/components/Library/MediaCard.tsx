import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Star, Trash2, ExternalLink, FileText, Image, Video, MessageCircle, HelpCircle } from "lucide-react";
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

  const getIcon = () => {
    switch (item.type) {
      case 'link':
        return <ExternalLink className="w-4 h-4" />;
      case 'note':
        return <FileText className="w-4 h-4" />;
      case 'image':
      case 'gallery':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'question':
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const renderPreview = () => {
    if (!item.file_details?.path) return null;

    const paths = Array.isArray(item.file_details.path) 
      ? item.file_details.path 
      : [item.file_details.path];

    if (item.type === 'gallery') {
      return (
        <div className="grid grid-cols-2 gap-1 mt-4">
          {paths.slice(0, 4).map((path, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={path}
                alt={`${item.title} - ${index + 1}`}
                className="w-full h-full object-cover rounded-md"
              />
              {index === 3 && paths.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-md">
                  +{paths.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (item.type === 'image' || item.type === 'video') {
      return (
        <div className="mt-4 aspect-video">
          {item.type === 'video' ? (
            <video 
              src={paths[0]} 
              controls 
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <img
              src={paths[0]}
              alt={item.title}
              className="w-full h-full object-cover rounded-md"
            />
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => {
          if (item.type === 'image' || item.type === 'video' || item.type === 'gallery') {
            setIsViewerOpen(true);
          }
        }}
      >
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {getIcon()}
              <h3 className="font-semibold">{item.title}</h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStarClick}
                className={item.is_starred ? "text-yellow-500" : ""}
              >
                <Star className={`h-4 w-4 ${item.is_starred ? "fill-yellow-500" : ""}`} />
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
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">{item.content}</p>
          {renderPreview()}
        </div>
      </Card>

      {(item.type === 'image' || item.type === 'video' || item.type === 'gallery') && item.file_details?.path && (
        <MediaViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          type={item.type === 'gallery' ? 'gallery' : item.type === 'video' ? 'video' : 'image'}
          src={item.file_details.path}
          title={item.title}
        />
      )}
    </>
  );
}