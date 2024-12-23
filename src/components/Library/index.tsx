import React, { useState } from "react";
import { useLibrary } from "@/hooks/useLibrary";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Link, FileText, Image, Video, MessageCircle, Edit2, HelpCircle } from "lucide-react";
import { LibraryItem, LibraryItemType } from "@/types/library";
import { MediaCard } from "./MediaCard";
import { ItemDialog } from "./ItemDialog";

const getIcon = (type: LibraryItemType) => {
  switch (type) {
    case 'link':
      return <Link className="w-4 h-4" />;
    case 'note':
      return <FileText className="w-4 h-4" />;
    case 'image':
      return <Image className="w-4 h-4" />;
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'whatsapp':
      return <MessageCircle className="w-4 h-4" />;
    case 'pdf':
      return <FileText className="w-4 h-4 text-red-500" />;
    case 'question':
      return <HelpCircle className="w-4 h-4 text-purple-500" />;
  }
};

const Library = () => {
  const { items, isLoading, filter, setFilter, addItem, deleteItem, toggleStar, updateItem } = useLibrary();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);

  const handleAddOrUpdateItem = async (data: any) => {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, ...data });
      } else {
        await addItem.mutateAsync(data);
      }
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error adding/updating item:', error);
    }
  };

  const handleEdit = (item: LibraryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ספריית תוכן</h2>
        <div className="flex gap-4">
          <Input
            type="search"
            placeholder="חיפוש..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
          <Button 
            onClick={() => {
              setEditingItem(null);
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            הוסף פריט
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item: LibraryItem) => {
          console.log("Rendering item:", item);
          return (
            <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                {item.file_details && (item.type === 'image' || item.type === 'video' || item.type === 'pdf' || item.type === 'image_gallery') && (
                  <MediaCard
                    type={item.type as "image" | "video" | "pdf" | "image_gallery"}
                    src={item.type === 'image_gallery' && item.file_details.paths ? item.file_details.paths : item.file_details.path}
                    title={item.title}
                  />
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => toggleStar.mutate({ id: item.id, is_starred: !item.is_starred })}
                    className="bg-white/80 hover:bg-white shadow-sm"
                  >
                    <Star className={`w-4 h-4 ${item.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleEdit(item)}
                    className="bg-white/80 hover:bg-white shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => deleteItem.mutate(item.id)}
                    className="bg-white/80 hover:bg-white shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getIcon(item.type)}
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{item.content}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <ItemDialog
        onSubmit={handleAddOrUpdateItem}
        initialData={editingItem}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingItem(null);
        }}
      />
    </div>
  );
};

export default Library;