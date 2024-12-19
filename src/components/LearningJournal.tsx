import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Editor from "./LearningJournal/Editor";
import { JournalEntryForm } from "./LearningJournal/JournalEntryForm";
import { ImageModal } from "@/components/ui/image-modal";

interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  is_important: boolean;
  user_id: string;
  image_url?: string | null;
}

export default function LearningJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast.error("יש להתחבר כדי לצפות ביומן");
        return;
      }

      const { data, error } = await supabase
        .from('learning_journal')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error("שגיאה בטעינת היומן");
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const entry = entries.find(e => e.id === id);
      
      // Delete the entry from the database
      const { error } = await supabase
        .from('learning_journal')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // If there was an image, delete it from storage
      if (entry?.image_url) {
        const path = entry.image_url.split('/').pop();
        if (path) {
          const { error: storageError } = await supabase.storage
            .from('content_library')
            .remove([path]);
          
          if (storageError) {
            console.error('Error deleting image:', storageError);
          }
        }
      }

      setEntries(entries.filter(entry => entry.id !== id));
      toast.success("הרשומה נמחקה בהצלחה!");
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error("שגיאה במחיקת רשומה");
    }
  };

  const updateEntry = async () => {
    if (!editingEntry) return;

    try {
      const { error } = await supabase
        .from('learning_journal')
        .update({ content: editingEntry.content })
        .eq('id', editingEntry.id);

      if (error) throw error;

      setEntries(entries.map(entry =>
        entry.id === editingEntry.id ? editingEntry : entry
      ));
      setIsEditing(false);
      setEditingEntry(null);
      toast.success("הרשומה עודכנה בהצלחה!");
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error("שגיאה בעדכון רשומה");
    }
  };

  if (loading) {
    return <div>טוען...</div>;
  }

  return (
    <Card className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-4">יומן למידה</h2>
      
      <JournalEntryForm onEntryAdded={loadEntries} />

      <div className="mt-6 space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id} className={`p-4 ${entry.is_important ? 'border-2 border-yellow-500' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                {entry.is_important && (
                  <Badge variant="secondary">חשוב</Badge>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingEntry(entry);
                    setIsEditing(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteEntry(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="prose prose-sm rtl" dangerouslySetInnerHTML={{ __html: entry.content }} />
            {entry.image_url && (
              <div className="mt-4">
                <img
                  src={entry.image_url}
                  alt="Entry image"
                  className="max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(entry.image_url)}
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString()}
            </p>
          </Card>
        ))}
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="w-full max-w-4xl">
          <DialogHeader>
            <DialogTitle>ערוך רשומה</DialogTitle>
          </DialogHeader>
          <div className="w-full max-h-[60vh] overflow-y-auto">
            <Editor
              content={editingEntry?.content || ""}
              onChange={(content) => setEditingEntry(editingEntry ? { ...editingEntry, content } : null)}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={updateEntry}>שמור שינויים</Button>
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setEditingEntry(null);
            }}>
              ביטול
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
      />
    </Card>
  );
}