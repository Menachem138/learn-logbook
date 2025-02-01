import React from 'react';
import { EventCard } from './EventCard';

type Event = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  user_id: string;
};

type EventListProps = {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
};

export function EventList({ events, onEdit, onDelete }: EventListProps) {
  if (!events || events.length === 0) {
    return <p className="text-gray-500">אין אירועים ביום זה</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}