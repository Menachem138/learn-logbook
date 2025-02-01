import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { JournalEntryForm } from './JournalEntryForm';
import { JournalEntry } from './JournalEntry';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface JournalEntryType {
  id: string;
  content: string;
  created_at: string;
  is_important: boolean;
  user_id: string;
}

export default function LearningJournal() {
  const [editingEntry, setEditingEntry] = React.useState<JournalEntryType | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('יש להתחבר כדי לצפות ביומן');
      }

      const { data, error } = await supabase
        .from('learning_journal')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('learning_journal')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast.success('הרשומה נמחקה בהצלחה');
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async (entry: JournalEntryType) => {
      const { error } = await supabase
        .from('learning_journal')
        .update({ content: entry.content })
        .eq('id', entry.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      setIsEditing(false);
      setEditingEntry(null);
      toast.success('הרשומה עודכנה בהצלחה');
    },
  });

  if (isLoading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="space-y-6 bg-white rounded-lg p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold mb-2">יומן למידה</h2>
        <h3 className="text-lg text-muted-foreground mb-4">מה למדת היום?</h3>
      </div>
      
      <JournalEntryForm onEntryAdded={() => queryClient.invalidateQueries({ queryKey: ['journal-entries'] })} />

      <div className="space-y-4 mt-8">
        {entries.map((entry) => (
          <JournalEntry
            key={entry.id}
            entry={entry}
            onEdit={() => {
              setEditingEntry(entry);
              setIsEditing(true);
            }}
            onDelete={() => deleteEntryMutation.mutate(entry.id)}
          />
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
            dir="rtl"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => updateEntryMutation.mutate(editingEntry!)}>שמור שינויים</Button>
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setEditingEntry(null);
            }}>
              ביטול
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}