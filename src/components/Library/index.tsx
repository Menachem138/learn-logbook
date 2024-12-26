import React, { useState } from "react";
import { useLibrary } from "@/hooks/useLibrary";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LibraryItem } from "./types";
import { LibraryItemCard } from "./LibraryItemCard";
import { ItemDialog } from "./ItemDialog";
import { useAuth } from "@/components/auth/AuthProvider";

const Library = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const { items, isLoading, error, filter, setFilter, addItem, deleteItem, toggleStar, updateItem } = useLibrary();
  const { session } = useAuth();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-lg">יש להתחבר כדי לצפות בספריית התוכן</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-lg text-red-500">שגיאה בטעינת הספרייה</p>
        <Button onClick={() => window.location.reload()}>נסה שוב</Button>
      </div>
    );
  }

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
          <LibraryItemCard
            key={item.id}
            item={item}
            onDelete={(id) => deleteItem.mutate(id)}
            onEdit={(item) => {
              setEditingItem(item);
              setIsDialogOpen(true);
            }}
            onToggleStar={(id, isStarred) => toggleStar.mutate({ id, is_starred: isStarred })}
          />
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