import { useState } from 'react';
import { Calendar as CalendarUI } from "../ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useToast } from "../../hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { EventForm } from './EventForm';
import { EventList } from './EventList';
import { CalendarHeader } from './CalendarHeader';

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

type ViewMode = 'day' | 'week' | 'month';

type NewEvent = Omit<Event, 'id' | 'user_id' | 'is_all_day' | 'created_at' | 'updated_at'>;

export function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<NewEvent>({
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
    mutationFn: async (eventData: NewEvent) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          user_id: userData.user.id,
          is_all_day: false,
        })
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

  const updateEventMutation = useMutation({
    mutationFn: async (eventData: Event) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          title: eventData.title,
          description: eventData.description,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
        })
        .eq('id', eventData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: "אירוע עודכן בהצלחה",
        description: "האירוע עודכן בלוח השנה שלך",
      });
      setIsEditEventOpen(false);
      setSelectedEvent(null);
    },
    onError: (error) => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לעדכן את האירוע",
        variant: "destructive",
      });
      console.error('Error updating event:', error);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: "אירוע נמחק בהצלחה",
        description: "האירוע הוסר מלוח השנה שלך",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו למחוק את האירוע",
        variant: "destructive",
      });
      console.error('Error deleting event:', error);
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

    addEventMutation.mutate(newEvent);
  };

  const handleEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    updateEventMutation.mutate(selectedEvent);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק אירוע זה?')) {
      deleteEventMutation.mutate(eventId);
    }
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
      <CardHeader>
        <CardTitle>לוח שנה</CardTitle>
        <CalendarHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddEvent={() => setIsAddEventOpen(true)}
        />
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
          ) : (
            <EventList
              events={selectedDateEvents || []}
              onEdit={(event) => {
                setSelectedEvent(event);
                setIsEditEventOpen(true);
              }}
              onDelete={handleDeleteEvent}
            />
          )}
        </div>
      </CardContent>

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף אירוע חדש</DialogTitle>
          </DialogHeader>
          <EventForm
            event={newEvent}
            onSubmit={handleAddEvent}
            onChange={(field, value) => setNewEvent({ ...newEvent, [field]: value })}
            submitText="הוסף אירוע"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ערוך אירוע</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventForm
              event={selectedEvent}
              onSubmit={handleEditEvent}
              onChange={(field, value) => setSelectedEvent({ ...selectedEvent, [field]: value })}
              submitText="שמור שינויים"
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
