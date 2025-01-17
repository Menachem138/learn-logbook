import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EventFormProps = {
  event: {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    is_all_day?: boolean;
    user_id?: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: string, value: string) => void;
  submitText: string;
};

export function EventForm({ event, onSubmit, onChange, submitText }: EventFormProps) {
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
          value={event.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="start_time">זמן התחלה</Label>
        <Input
          id="start_time"
          type="datetime-local"
          value={event.start_time}
          onChange={(e) => onChange('start_time', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="end_time">זמן סיום</Label>
        <Input
          id="end_time"
          type="datetime-local"
          value={event.end_time}
          onChange={(e) => onChange('end_time', e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full">
        {submitText}
      </Button>
    </form>
  );
}