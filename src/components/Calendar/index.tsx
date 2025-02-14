import { useState } from 'react';
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Plus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventForm } from './EventForm';
import { EventList } from './EventList';

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
      
      const startTime = new Date(eventData.start_time).toISOString();
      const endTime = new Date(eventData.end_time).toISOString();
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          start_time: startTime,
          end_time: endTime,
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
      const startTime = new Date(eventData.start_time).toISOString();
      const endTime = new Date(eventData.end_time).toISOString();
      
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          title: eventData.title,
          description: eventData.description,
          start_time: startTime,
          end_time: endTime,
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
    if (!date) return false;
    
    const eventDate = new Date(event.start_time);
    const selectedDate = new Date(date);
    
    return (
      eventDate.getFullYear() === selectedDate.getFullYear() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getDate() === selectedDate.getDate()
    );
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium">לוח שנה</h1>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Heart className="w-5 h-5" />
          </Button>
        </div>
        <CalendarUI
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={he}
          className="custom-calendar"
        />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium">היום</h2>
          <Button
            onClick={() => setIsAddEventOpen(true)}
            variant="ghost"
            size="icon"
            className="rounded-full bg-white shadow-sm hover:bg-gray-50"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
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

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="rounded-3xl">
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
        <DialogContent className="rounded-3xl">
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
    </div>
  );
}
