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
import { Trash2, Edit } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

type Event = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  user_id: string;
};

export function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
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
    mutationFn: async (eventData: Omit<Event, 'id' | 'user_id' | 'is_all_day'>) => {
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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    console.log('Google Calendar login success:', credentialResponse);
    toast({
      title: "התחברות הצליחה",
      description: "התחברת בהצלחה לחשבון Google Calendar שלך",
    });
  };

  const handleGoogleError = () => {
    toast({
      title: "שגיאה",
      description: "ההתחברות ל-Google Calendar נכשלה",
      variant: "destructive",
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
        <div className="flex gap-2">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
          />
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
        </div>

        <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>ערוך אירוע</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <form onSubmit={handleEditEvent} className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">כותרת</Label>
                  <Input
                    id="edit-title"
                    value={selectedEvent.title}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">תיאור</Label>
                  <Input
                    id="edit-description"
                    value={selectedEvent.description || ''}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-start-time">זמן התחלה</Label>
                  <Input
                    id="edit-start-time"
                    type="datetime-local"
                    value={selectedEvent.start_time}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end-time">זמן סיום</Label>
                  <Input
                    id="edit-end-time"
                    type="datetime-local"
                    value={selectedEvent.end_time}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, end_time: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  שמור שינויים
                </Button>
              </form>
            )}
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
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsEditEventOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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