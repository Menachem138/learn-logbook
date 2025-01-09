import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import Editor from "./LearningJournal/Editor";
import { JournalEntryForm } from "./LearningJournal/JournalEntryForm";
import { JournalEntryCard } from "./LearningJournal/JournalEntryCard";
import { SearchBar } from "./LearningJournal/SearchBar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';

interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  is_important: boolean;
  user_id: string;
  tags?: string[];
}

export default function LearningJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  const exportToPDF = () => {
    try {
      toast.info("מכין את הקובץ להורדה...");
      
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      // Add a custom font for Hebrew support
      doc.addFont("https://fonts.gstatic.com/s/heebo/v21/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiSysdUmj.ttf", "Heebo", "normal");
      doc.setFont("Heebo");
      
      // Enable right-to-left mode
      doc.setR2L(true);
      
      // Add title
      doc.setFontSize(24);
      doc.text("יומן למידה", 190, 20);
      
      // Add entries
      doc.setFontSize(12);
      let yPosition = 40;
      
      const entriesToExport = filteredEntries.length > 0 ? filteredEntries : entries;
      
      entriesToExport.forEach((entry) => {
        // Clean content from HTML tags
        const cleanContent = entry.content.replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        
        // Add date
        const date = new Date(entry.created_at).toLocaleDateString('he-IL');
        doc.setFontSize(10);
        doc.text(date, 190, yPosition);
        yPosition += 7;
        
        // Add content
        doc.setFontSize(12);
        const maxWidth = 170;
        const lines = doc.splitTextToSize(cleanContent, maxWidth);
        
        // Check if we need a new page
        if (yPosition + (lines.length * 7) > 280) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Add content lines
        lines.forEach((line: string) => {
          doc.text(line, 190, yPosition);
          yPosition += 7;
        });
        
        // Add separator
        if (yPosition < 280) {
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 10;
        }
      });
      
      // Save the PDF
      const date = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
      doc.save(`יומן-למידה-${date}.pdf`);
      
      toast.success("הקובץ הורד בהצלחה!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("שגיאה בהכנת הקובץ");
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [searchQuery, selectedTags, entries]);

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
      
      // Extract all unique tags
      const tags = data?.reduce((acc: string[], entry: JournalEntry) => {
        if (entry.tags) {
          return [...new Set([...acc, ...entry.tags])];
        }
        return acc;
      }, []);
      setAllTags(tags);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error("שגיאה בטעינת היומן");
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(entry =>
        entry.tags?.some(tag => selectedTags.includes(tag))
      );
    }

    setFilteredEntries(filtered);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
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

  if (loading) {
    return <div>טוען...</div>;
  }

  return (
    <Card className="p-6 w-full bg-background text-foreground transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">יומן למידה</h2>
        <Button
          onClick={exportToPDF}
          className="flex items-center gap-2"
          variant="outline"
        >
          <FileDown className="h-4 w-4" />
          ייצא ל-PDF
        </Button>
      </div>
      
      <JournalEntryForm onEntryAdded={loadEntries} />

      <div className="mt-6 space-y-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {(filteredEntries.length === 0 && (searchQuery || selectedTags.length > 0)) ? (
          <div className="text-center text-muted-foreground py-8">
            לא נמצאו רשומות התואמות לחיפוש
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onEdit={() => {
                setEditingEntry(entry);
                setIsEditing(true);
              }}
              onDelete={() => deleteEntry(entry.id)}
              onGenerateSummary={() => generateSummary(entry)}
            />
          ))
        )}
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

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>סיכום רשומה</DialogTitle>
          </DialogHeader>
          <div className="mt-4 whitespace-pre-wrap">
            {summary}
          </div>
          <Button 
            onClick={() => setShowSummary(false)} 
            className="mt-4"
          >
            סגור
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
