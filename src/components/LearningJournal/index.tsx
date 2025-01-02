import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntryForm } from "./JournalEntryForm";
import { CollapsibleEntry } from "./CollapsibleEntry";
import { JournalHeader } from "./components/JournalHeader";
import { JournalDialogs } from "./components/JournalDialogs";
import { useJournalEntries } from "./hooks/useJournalEntries";

interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  is_important: boolean;
  user_id: string;
}

export default function LearningJournal() {
  const { entries, loading, deleteEntry, updateEntry, loadEntries } = useJournalEntries();
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const generateSummary = async (entry: JournalEntry) => {
    try {
      setSummarizing(true);
      const { data, error } = await supabase.functions.invoke('summarize-journal', {
        body: { content: entry.content }
      });

      if (error) throw error;

      setSummary(data.summary);
      setShowSummary(true);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error("שגיאה בהפקת סיכום");
    } finally {
      setSummarizing(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(entry.content, 'text/html');
    const textContent = doc.body.textContent || '';
    return textContent.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <div>טוען...</div>;
  }

  return (
    <Card className="p-6 w-full bg-background text-foreground transition-colors duration-300">
      <JournalHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={() => setSearchTerm("")}
      />
      
      <JournalEntryForm onEntryAdded={loadEntries} />

      <div className="mt-6 space-y-4">
        {filteredEntries.map((entry) => (
          <CollapsibleEntry
            key={entry.id}
            entry={entry}
            onEdit={() => {
              setEditingEntry(entry);
              setIsEditing(true);
            }}
            onDelete={() => deleteEntry(entry.id)}
            onGenerateSummary={() => generateSummary(entry)}
            onImageClick={setSelectedImage}
          />
        ))}
      </div>

      <JournalDialogs
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editingEntry={editingEntry}
        setEditingEntry={setEditingEntry}
        onUpdateEntry={updateEntry}
        showSummary={showSummary}
        setShowSummary={setShowSummary}
        summary={summary}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </Card>
  );
}