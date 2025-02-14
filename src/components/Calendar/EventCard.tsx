
import React from 'react';
import { format } from 'date-fns';
import { Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";

type Event = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  user_id: string;
};

type EventCardProps = {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  color?: 'pink' | 'purple' | 'mint' | 'peach';
};

const colorClasses = {
  pink: 'bg-gradient-to-br from-pink-100 to-pink-200',
  purple: 'bg-gradient-to-br from-purple-100 to-purple-200',
  mint: 'bg-gradient-to-br from-green-100 to-green-200',
  peach: 'bg-gradient-to-br from-orange-100 to-orange-200'
};

export function EventCard({ event, onEdit, onDelete, color = 'pink' }: EventCardProps) {
  return (
    <div 
      className={`${colorClasses[color]} rounded-3xl p-6 relative cursor-pointer transition-transform hover:scale-[1.02]`}
      onClick={() => onEdit(event)}
    >
      <div className="flex justify-between items-start">
        <div className="bg-white px-4 py-2 rounded-full text-sm font-medium mb-4">
          {event.user_id.slice(0, 4)}
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={(e) => {
          e.stopPropagation();
          // Add to favorites logic here
        }}>
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      <h3 className="text-xl font-medium mb-2">{event.title}</h3>
      <p className="text-sm text-gray-600 mb-1">{event.description}</p>
      <p className="text-sm text-gray-500">
        {format(new Date(event.start_time), 'HH:mm')}
      </p>

      <div className="flex gap-2 mt-4">
        <div className="bg-white/50 px-3 py-1 rounded-full text-sm">
          {format(new Date(event.end_time), 'HH:mm')}
        </div>
      </div>
    </div>
  );
}
