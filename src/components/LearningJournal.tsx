import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import Editor from "./LearningJournal/Editor";
import { JournalEntryForm } from "./LearningJournal/JournalEntryForm";
import { JournalEntryCard } from "./LearningJournal/JournalEntryCard";
import { SearchBar } from "./LearningJournal/SearchBar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FileDown } from 'lucide-react';

interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  is_important: boolean;
  user_id: string;
  tags?: string[];
  image_url?: string | null;
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
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

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

    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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

  const exportToPDF = async () => {
    try {
      if (selectedEntries.length === 0) {
        toast.error("יש לבחור לפחות רשומה אחת לייצוא");
        return;
      }

      const entriesToExport = entries.filter(entry => 
        selectedEntries.includes(entry.id)
      );

      // Create a temporary container with proper styling
      const container = document.createElement('div');
      container.style.width = '800px';  // Fixed width for better rendering
      container.style.backgroundColor = '#ffffff';
      container.style.direction = 'rtl';
      container.style.padding = '40px';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      // Add content with proper styling
      container.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #000000; max-width: 100%; margin: 0 auto;">
          <h1 style="text-align: center; margin-bottom: 30px; font-size: 24px; color: #000000;">
            יומן למידה - רשומות נבחרות
          </h1>
          ${entriesToExport.map(entry => `
            <div style="margin-bottom: 40px; background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; page-break-inside: avoid; width: 100%;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div style="font-size: 14px; color: #666666;">
                  ${new Date(entry.created_at).toLocaleDateString('he-IL')}
                </div>
                ${entry.is_important ? 
                  '<div style="color: #FFB800; font-weight: bold;">⭐ חשוב</div>' : 
                  ''}
              </div>
              ${entry.tags?.length ? `
                <div style="margin-bottom: 15px; display: flex; gap: 8px; flex-wrap: wrap;">
                  ${entry.tags.map(tag => `
                    <span style="background-color: #f3f4f6; color: #000000; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                      ${tag}
                    </span>
                  `).join('')}
                </div>
              ` : ''}
              <div style="white-space: pre-wrap; color: #000000; font-size: 14px; line-height: 1.6; width: 100%;">
                ${entry.content.replace(/\n/g, '<br>')}
              </div>
              ${entry.image_url ? `
                <div style="margin-top: 15px; width: 100%;">
                  <img src="${entry.image_url}" style="max-width: 100%; height: auto; border-radius: 4px;" />
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;

      // Generate PDF with proper settings
      const pdf = new jsPDF('p', 'pt', 'a4');
      
      try {
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: '#ffffff',
          windowWidth: container.scrollWidth,
          windowHeight: container.scrollHeight,
        });

        const contentWidth = pdf.internal.pageSize.getWidth();
        const contentHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        let heightLeft = imgHeight;
        let position = 0;
        let pageHeight = contentHeight;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth * ratio, imgHeight * ratio);
          heightLeft -= pageHeight;
        }

        pdf.save('learning-journal.pdf');
        toast.success("הקובץ יוצא בהצלחה!");
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error("שגיאה בייצוא הקובץ");
      } finally {
        document.body.removeChild(container);
      }
    } catch (error) {
      console.error('Error in PDF export:', error);
      toast.error("שגיאה בייצוא הקובץ");
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
          variant="outline"
          className="flex items-center gap-2"
          disabled={selectedEntries.length === 0}
        >
          <FileDown className="h-4 w-4" />
          ייצוא לPDF ({selectedEntries.length})
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
            <div key={entry.id} className="flex items-start gap-4">
              <Checkbox
                id={`select-${entry.id}`}
                checked={selectedEntries.includes(entry.id)}
                onCheckedChange={() => toggleEntrySelection(entry.id)}
                className="mt-4"
              />
              <div className="flex-1">
                <JournalEntryCard
                  entry={entry}
                  onEdit={() => {
                    setEditingEntry(entry);
                    setIsEditing(true);
                  }}
                  onDelete={() => deleteEntry(entry.id)}
                  onGenerateSummary={() => generateSummary(entry)}
                />
              </div>
            </div>
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
