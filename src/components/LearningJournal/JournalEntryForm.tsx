import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Editor from "./Editor";
import { supabase } from "@/integrations/supabase/client";
import { triggerConfetti } from "@/utils/confetti";

interface JournalEntryFormProps {
  onEntryAdded: () => void;
}

export function JournalEntryForm({ onEntryAdded }: JournalEntryFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addEntry = async (isImportant: boolean = false) => {
    if (!content.trim()) {
      toast.error("אנא הכנס תוכן ליומן");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast.error("יש להתחבר כדי להוסיף רשומה");
        return;
      }

      const { error } = await supabase
        .from('learning_journal')
        .insert([{
          content,
          is_important: isImportant,
          user_id: session.session.user.id
        }]);

      if (error) throw error;

      setContent("");
      onEntryAdded();
      toast.success("הרשומה נוספה בהצלחה!");
      triggerConfetti(); // Trigger confetti after successful entry
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error("שגיאה בהוספת רשומה");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Editor
          content={content}
          onChange={setContent}
          onClear={() => setContent("")}
        />
      </div>
      <div className="flex space-x-2">
        <Button 
          onClick={() => addEntry(false)} 
          className="flex-1"
          disabled={isSubmitting}
        >
          הוסף רשומה
        </Button>
        <Button 
          onClick={() => addEntry(true)} 
          variant="secondary" 
          className="flex-1"
          disabled={isSubmitting}
        >
          הוסף כהערה חשובה
        </Button>
      </div>
    </div>
  );
}