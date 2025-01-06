import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntryForm } from "./JournalEntryForm";
import { JournalHeader } from "./components/JournalHeader";
import { JournalFilters } from "./components/JournalFilters";
import { JournalEntry } from "./components/JournalEntry";
import Editor from "./Editor";

interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  is_important: boolean;
  user_id: string;
  type?: 'learning' | 'trading';
}

export default function LearningJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [isAddingEntry, setIsAddingEntry] = useState(false);

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
      const { error } = await supabase
        .from('learning_journal')
        .delete()
        .eq('id', id);

      if (error) throw error;

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

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || entry.type === selectedTag;
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return <div>טוען...</div>;
  }

  return (
    <Card className="p-6 w-full bg-background text-foreground transition-colors duration-300">
      <JournalHeader onAddEntry={() => setIsAddingEntry(true)} />
      
      <JournalFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
      />

      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <JournalEntry
            key={entry.id}
            entry={entry}
            onEdit={() => {
              setEditingEntry(entry);
              setIsEditing(true);
            }}
            onDelete={() => deleteEntry(entry.id)}
          />
        ))}
      </div>

      <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף רשומה חדשה</DialogTitle>
          </DialogHeader>
          <JournalEntryForm
            onEntryAdded={() => {
              loadEntries();
              setIsAddingEntry(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ערוך רשומה</DialogTitle>
          </DialogHeader>
          <Editor
            content={editingEntry?.content || ""}
            onChange={(content) => setEditingEntry(editingEntry ? { ...editingEntry, content } : null)}
          />
          <div className="flex justify-end gap-2 mt-4">
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
    </Card>
  );
}