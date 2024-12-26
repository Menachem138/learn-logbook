import React, { useState } from "react";
import { useLibrary } from "@/hooks/useLibrary";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Link, FileText, Image, Video, MessageCircle, Edit2, HelpCircle, Plus, Music } from "lucide-react";
import { LibraryItem, LibraryItemType } from "@/types/library";
import { MediaCard } from "./MediaCard";
import { ItemDialog } from "./ItemDialog";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";

const getIcon = (type: LibraryItemType) => {
  switch (type) {
    case 'link':
      return <Link className="w-4 h-4" />;
    case 'note':
      return <FileText className="w-4 h-4" />;
    case 'image':
    case 'image_album':
      return <Image className="w-4 h-4" />;
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'audio':
      return <Music className="w-4 h-4" />;
    case 'whatsapp':
      return <MessageCircle className="w-4 h-4" />;
    case 'pdf':
      return <FileText className="w-4 h-4 text-red-500" />;
    case 'question':
      return <HelpCircle className="w-4 h-4 text-purple-500" />;
    default:
      return null;
  }
};

const Library = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const { items, isLoading, error, filter, setFilter, addItem, deleteItem, toggleStar, updateItem } = useLibrary();
  const { session } = useAuth();

  // Check for authentication
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-lg">יש להתחבר כדי לצפות בספריית התוכן</p>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    toast.error("שגיאה בטעינת הספרייה");
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-lg text-red-500">שגיאה בטעינת הספרייה</p>
        <Button onClick={() => window.location.reload()}>נסה שוב</Button>
      </div>
    );
  }

  const handleAddOrUpdateItem = async (data: any) => {
    try {
      console.log("Handling item submission:", data);
      
      if (editingItem) {
        console.log("Updating existing item:", editingItem.id, data);
        await updateItem.mutateAsync({ id: editingItem.id, ...data });
      } else {
        console.log("Adding new item:", data);
        await addItem.mutateAsync(data);
      }
      
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success(editingItem ? "פריט עודכן בהצלחה" : "פריט נוסף בהצלחה");
    } catch (error) {
      console.error('Error adding/updating item:', error);
      toast.error("שגיאה בשמירת הפריט");
    }
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
            <Plus className="w-4 h-4" />
            הוסף פריט
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
                  onClick={() => {
                    setEditingItem(item);
                    setIsDialogOpen(true);
                  }}
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
            
            {(item.type === 'image' || item.type === 'video' || item.type === 'pdf' || item.type === 'audio' || item.type === 'image_album') && (
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
        ))}
      </div>

      <ItemDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleAddOrUpdateItem}
        initialData={editingItem}
      />
    </div>
  );
};

export default Library;