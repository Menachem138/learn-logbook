
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from 'lucide-react';

type Event = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  user_id: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type EventCardProps = {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
};

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const formatLocalTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm');
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold">{event.title}</h4>
            <p className="text-sm text-gray-500">{event.description}</p>
            <p className="text-sm text-gray-500">
              {formatLocalTime(event.start_time)} - {formatLocalTime(event.end_time)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(event)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
