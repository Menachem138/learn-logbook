import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface JournalEntry {
  id: string;
  content: string;
  created_at: Date;
  is_important: boolean;
}

export default function LearningJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const addEntry = async (isImportant: boolean = false) => {
    if (!newEntry.trim()) {
      toast.error("אנא הכנס תוכן ליומן");
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast.error("יש להתחבר כדי להוסיף רשומה");
        return;
      }

      const { data, error } = await supabase
        .from('learning_journal')
        .insert([{
          content: newEntry,
          is_important: isImportant,
          user_id: session.session.user.id
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEntries([data, ...entries]);
        setNewEntry("");
        toast.success("הרשומה נוספה בהצלחה!");
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error("שגיאה בהוספת רשומה");
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

  if (loading) {
    return <div>טוען...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">יומן למידה</h2>
      <div className="space-y-4">
        <Textarea
          placeholder="מה למדת היום?"
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex space-x-2">
          <Button onClick={() => addEntry(false)} className="flex-1">
            הוסף רשומה
          </Button>
          <Button onClick={() => addEntry(true)} variant="secondary" className="flex-1">
            הוסף כהערה חשובה
          </Button>
        </div>
      </div>
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
            <p className="whitespace-pre-wrap">{entry.content}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString()}
            </p>
          </Card>
        ))}
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ערוך רשומה</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editingEntry?.content || ""}
            onChange={(e) => setEditingEntry(editingEntry ? { ...editingEntry, content: e.target.value } : null)}
            className="min-h-[200px]"
          />
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
    </Card>
  );
}