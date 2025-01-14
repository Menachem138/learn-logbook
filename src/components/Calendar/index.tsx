'use client';

import { useState } from 'react';
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

type Event = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
};

export function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  const addEventMutation = useMutation({
    mutationFn: async (eventData: Omit<Event, 'id'>) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: "אירוע נוסף בהצלחה",
        description: "האירוע נוסף ללוח השנה שלך",
      });
      setIsAddEventOpen(false);
      setNewEvent({ title: '', description: '', start_time: '', end_time: '' });
    },
    onError: (error) => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו להוסיף את האירוע",
        variant: "destructive",
      });
      console.error('Error adding event:', error);
    },
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    addEventMutation.mutate({
      ...newEvent,
      is_all_day: false,
    });
  };

  const selectedDateEvents = events?.filter(event => {
    const eventDate = new Date(event.start_time);
    return date && 
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear();
  });

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>לוח שנה</CardTitle>
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogTrigger asChild>
            <Button>הוסף אירוע</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>הוסף אירוע חדש</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <Label htmlFor="title">כותרת</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">תיאור</Label>
                <Input
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="start_time">זמן התחלה</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_time">זמן סיום</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                הוסף אירוע
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <CalendarUI
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={he}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-4">
            {date ? format(date, 'EEEE, d בMMMM', { locale: he }) : 'בחר תאריך'}
          </h3>
          {isLoading ? (
            <p>טוען אירועים...</p>
          ) : selectedDateEvents && selectedDateEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedDateEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-gray-500">{event.description}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">אין אירועים ביום זה</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}