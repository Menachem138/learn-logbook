
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EventFormProps = {
  event: {
    title: string;
    description?: string | null;
    start_time: string;
    end_time: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: string, value: string) => void;
  submitText: string;
};

export function EventForm({ event, onSubmit, onChange, submitText }: EventFormProps) {
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // המרת התאריך לאובייקט Date
      const date = new Date(dateString);
      
      // פורמט התאריך לפורמט של input datetime-local
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleDateChange = (field: string, value: string) => {
    if (!value) {
      onChange(field, '');
      return;
    }

    try {
      // המרת התאריך שנבחר לאובייקט Date
      const selectedDate = new Date(value);
      
      // יצירת תאריך UTC במדויק לפי השעה שנבחרה
      const utcDate = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedDate.getHours(),
        selectedDate.getMinutes()
      ));

      onChange(field, utcDate.toISOString());
    } catch (error) {
      console.error('Error handling date change:', error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">כותרת</Label>
        <Input
          id="title"
          value={event.title}
          onChange={(e) => onChange('title', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="description">תיאור</Label>
        <Input
          id="description"
          value={event.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="start_time">זמן התחלה</Label>
        <Input
          id="start_time"
          type="datetime-local"
          value={formatDateForInput(event.start_time)}
          onChange={(e) => handleDateChange('start_time', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="end_time">זמן סיום</Label>
        <Input
          id="end_time"
          type="datetime-local"
          value={formatDateForInput(event.end_time)}
          onChange={(e) => handleDateChange('end_time', e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full">
        {submitText}
      </Button>
    </form>
  );
}
