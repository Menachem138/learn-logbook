import React, { useState } from "react";
import { useLibrary } from "@/hooks/useLibrary";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Link, FileText, Image, Video, MessageCircle, Edit2, HelpCircle } from "lucide-react";
import { LibraryItem, LibraryItemType, LibraryItemInput, LibraryItemUpdate } from "@/types/library";
import { MediaCard } from "./MediaCard";
import { ItemDialog } from "./ItemDialog";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleAddOrUpdateItem = async (data: LibraryItemInput) => {
    try {
      if (editingItem) {
        const updateData: LibraryItemUpdate = {
          id: editingItem.id,
          title: data.title,
          content: data.content,
          type: data.type,
          files: data.files,
          file_details: data.file_details
        };
        await updateItem.mutateAsync(updateData);
        toast({
          title: "פריט עודכן בהצלחה",
        });
      } else {
        await addItem.mutateAsync(data);
        toast({
          title: "פריט נוסף בהצלחה",
        });
      }
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error adding/updating item:', error);
      toast({
        title: "שגיאה בשמירת הפריט",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: LibraryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteImage = async (item: LibraryItem, imageIndex: number) => {
    if (!item.file_details?.paths) return;

    try {
      const newPaths = [...item.file_details.paths];
      newPaths.splice(imageIndex, 1);
      
      if (newPaths.length === 0) {
        await deleteItem.mutateAsync(item.id);
        toast({
          title: "אלבום נמחק בהצלחה",
        });
      } else {
        const updateData: LibraryItemUpdate = {
          id: item.id,
          title: item.title,
          content: item.content,
          type: item.type,
          file_details: { paths: newPaths }
        };
        await updateItem.mutateAsync(updateData);
        toast({
          title: "תמונה נמחקה בהצלחה",
        });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "שגיאה במחיקת התמונה",
        variant: "destructive",
      });
    }
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
        {items.map((item: LibraryItem) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {item.file_details && (item.type === 'image' || item.type === 'video' || item.type === 'pdf' || item.type === 'image_gallery') && (
              <div className="relative aspect-video">
                <MediaCard
                  type={item.type as "image" | "video" | "pdf" | "image_gallery"}
                  src={item.type === 'image_gallery' && item.file_details.paths ? item.file_details.paths : item.file_details.path}
                  title={item.title}
                  onDeleteImage={item.type === 'image_gallery' ? (index) => handleDeleteImage(item, index) : undefined}
                />
              </div>
            )}
            <div className="p-4">
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
              <p className="text-sm text-gray-600">{item.content}</p>
            </div>
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
    </div>
  );
};

export default Library;