import React, { useState } from "react";
import { useLibrary } from "@/hooks/useLibrary";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Edit2, Trash2, Youtube } from "lucide-react";
import { MediaCard } from "../Library/MediaCard";
import { ItemDialog } from "../Library/ItemDialog";
import { LibraryItem } from "@/types/library";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const YouTubeLibrary = () => {
  const { items, isLoading, filter, setFilter, addItem, deleteItem, toggleStar, updateItem } = useLibrary();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [viewingVideoId, setViewingVideoId] = useState<string | null>(null);

  const youtubeItems = items.filter(item => item.type === 'youtube');

  const handleAddOrUpdateItem = async (data: Partial<LibraryItem> & { file?: File }) => {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({
          id: editingItem.id,
          title: data.title!,
          content: data.content!,
          type: 'youtube'
        });
      } else {
        await addItem.mutateAsync({
          title: data.title!,
          content: data.content!,
          type: 'youtube'
        });
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

  const handleViewVideo = (id: string) => {
    const item = youtubeItems.find(item => item.id === id);
    if (item) {
      setViewingVideoId(item.content);
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
        <h2 className="text-2xl font-bold">ספריית סרטוני YouTube</h2>
        <div className="flex gap-4">
          <Input
            type="search"
            placeholder="חיפוש..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
            dir="rtl"
          />
          <Button
            onClick={() => {
              setEditingItem(null);
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Youtube className="w-4 h-4" />
            הוסף סרטון
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {youtubeItems.map((item) => (
          <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4" />
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
            <div className="mt-2">
              <MediaCard
                type="youtube"
                src={item.content}
                title={item.title}
                id={item.id}
                onView={handleViewVideo}
              />
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

      <Dialog open={!!viewingVideoId} onOpenChange={() => setViewingVideoId(null)}>
        <DialogContent className="sm:max-w-[800px]">
          {viewingVideoId && (
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${viewingVideoId}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YouTubeLibrary;
