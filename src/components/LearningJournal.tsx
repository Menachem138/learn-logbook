import React, { useState, useEffect, useRef } from "react";
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileDown } from 'lucide-react';

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

  const journalContentRef = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!journalContentRef.current) return;

    try {
      toast.info("מכין את הקובץ להורדה...");
      
      // Find and click all "show more" buttons
      const buttons = journalContentRef.current.querySelectorAll('button');
      const expandButtons = Array.from(buttons).filter(button => 
        button.textContent?.includes('הצג עוד')
      );
      
      // Expand all entries
      for (const button of expandButtons) {
        button.click();
        // Wait a bit between each expansion
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Wait for content to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = journalContentRef.current;
      
      // Save original styles
      const originalStyles = {
        width: element.style.width,
        height: element.style.height,
        overflow: element.style.overflow,
        position: element.style.position,
        background: element.style.background
      };
      
      // Set temporary styles for capture
      element.style.width = '800px';
      element.style.height = 'auto';
      element.style.overflow = 'visible';
      element.style.position = 'relative';
      element.style.background = 'white';
      
      try {
        const canvas = await html2canvas(element, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: true, // Enable logging for debugging
          width: 800,
          height: element.scrollHeight,
          windowWidth: 800,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector('[data-journal-content]') as HTMLElement;
            if (clonedElement) {
              clonedElement.style.width = '800px';
              clonedElement.style.height = 'auto';
              clonedElement.style.overflow = 'visible';
              clonedElement.style.position = 'relative';
              clonedElement.style.background = 'white';
              
              // Ensure all images are loaded
              const images = clonedElement.getElementsByTagName('img');
              return Promise.all(Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise((resolve) => {
                  img.onload = resolve;
                  img.onerror = resolve;
                });
              }));
            }
          }
        });

        // Create PDF with specific dimensions
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const pdf = new jsPDF({
          orientation: imgHeight > pageHeight ? 'p' : 'p',
          unit: 'mm',
          format: 'a4',
        });
        
        let heightLeft = imgHeight;
        let position = 0;
        let pageNumber = 1;
        
        // First page
        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Additional pages if needed
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          pageNumber++;
        }
        
        const date = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
        pdf.save(`יומן-למידה-${date}.pdf`);
        
        toast.success("הקובץ הורד בהצלחה!");
      } finally {
        // Restore original styles
        Object.assign(element.style, originalStyles);
        
        // Collapse entries back
        for (const button of expandButtons) {
          button.click();
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
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

      <div className="mt-6 space-y-4" ref={journalContentRef} data-journal-content>
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
