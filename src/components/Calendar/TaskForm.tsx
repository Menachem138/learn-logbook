
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Task = {
  title: string;
  description?: string | null;
  due_date: string;
  priority: 'urgent' | 'medium' | 'low';
};

type TaskFormProps = {
  task: Task;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: string, value: any) => void;
  submitText: string;
};

export function TaskForm({ task, onSubmit, onChange, submitText }: TaskFormProps) {
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">כותרת</Label>
        <Input
          id="title"
          value={task.title}
          onChange={(e) => onChange('title', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="description">תיאור</Label>
        <Input
          id="description"
          value={task.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="due_date">מועד סיום</Label>
        <Input
          id="due_date"
          type="datetime-local"
          value={formatDateForInput(task.due_date)}
          onChange={(e) => onChange('due_date', new Date(e.target.value).toISOString())}
        />
      </div>
      <div>
        <Label htmlFor="priority">עדיפות</Label>
        <Select
          value={task.priority}
          onValueChange={(value: 'urgent' | 'medium' | 'low') => onChange('priority', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="בחר עדיפות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="urgent">דחוף</SelectItem>
            <SelectItem value="medium">בינוני</SelectItem>
            <SelectItem value="low">נמוך</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">
        {submitText}
      </Button>
    </form>
  );
}
