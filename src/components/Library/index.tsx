import React, { useState } from "react";
import { useLibrary } from "@/hooks/useLibrary";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Link, FileText, Image, Video, MessageCircle, Edit2, Images } from "lucide-react";
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
      return <MessageCircle className="w-4 h-4 text-purple-500" />;
    case 'image_album':
      return <Images className="w-4 h-4" />;
  }
};

const Library = () => {
  const { items, isLoading, filter, setFilter, addItem, deleteItem, toggleStar, updateItem } = useLibrary();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlbumDialogOpen, setIsAlbumDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);

  const handleAddOrUpdateItem = async (data: any) => {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, ...data });
      } else {
        await addItem.mutateAsync(data);
      }
      setIsDialogOpen(false);
      setIsAlbumDialogOpen(false);
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

  const renderMediaContent = (item: LibraryItem) => {
    if (!item.file_details) return null;

    if (item.type === 'image_album' && Array.isArray(item.file_details)) {
      return (
        <MediaCard
          type="image_album"
          src={item.file_details}
          title={item.title}
        />
      );
    }

    if ((item.type === 'image' || item.type === 'video' || item.type === 'pdf') && !Array.isArray(item.file_details)) {
      return (
        <MediaCard
          type={item.type}
          src={item.file_details.path}
          title={item.title}
        />
      );
    }

    return null;
  };

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
          <Button
            onClick={() => {
              setEditingItem(null);
              setIsAlbumDialogOpen(true);
            }}
            variant="secondary"
            className="gap-2"
          >
            <Images className="w-4 h-4" />
            הוסף אלבום תמונות
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item: LibraryItem) => (
          <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {getIcon(item.type)}
                <h3 className="font-semibold">{item.title}</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleStar.mutate({ id: item.id, is_starred: !item.is_starred })}
                  className="hover:text-yellow-400"
                >
                  <Star className={`w-4 h-4 ${item.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(item)}
                  className="hover:text-blue-500"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem.mutate(item.id)}
                  className="hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">{item.content}</p>
            {renderMediaContent(item)}
          </Card>
        ))}
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

      <ItemDialog
        onSubmit={handleAddOrUpdateItem}
        initialData={null}
        isOpen={isAlbumDialogOpen}
        onClose={() => {
          setIsAlbumDialogOpen(false);
        }}
        defaultType="image_album"
      />
    </div>
  );
};

export default Library;
