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
};

type EventCardProps = {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
};

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold">{event.title}</h4>
            <p className="text-sm text-gray-500">{event.description}</p>
            <p className="text-sm text-gray-500">
              {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
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