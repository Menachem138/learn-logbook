import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Editor from "./Editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JournalEntryFormProps {
  onEntryAdded: () => void;
}

export function JournalEntryForm({ onEntryAdded }: JournalEntryFormProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<'learning' | 'trading'>('learning');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("יש להזין תוכן לרשומה");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast.error("יש להתחבר כדי להוסיף רשומה");
        return;
      }

      const { error } = await supabase
        .from('learning_journal')
        .insert([
          {
            content,
            type,
            user_id: session.session.user.id,
          },
        ]);

      if (error) throw error;

      toast.success("הרשומה נוספה בהצלחה!");
      setContent("");
      onEntryAdded();
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error("שגיאה בהוספת רשומה");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Select value={type} onValueChange={(value: 'learning' | 'trading') => setType(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="בחר סוג רשומה" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="learning">למידה</SelectItem>
            <SelectItem value="trading">מסחר</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Editor content={content} onChange={setContent} />

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'מוסיף...' : 'הוסף רשומה'}
        </Button>
      </div>
    </div>
  );
}