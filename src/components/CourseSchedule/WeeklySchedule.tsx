import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
}

export default function WeeklySchedule() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [newEvent, setNewEvent] = React.useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    is_all_day: false
  });

  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('יש להתחבר כדי לצפות באירועים');
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', session.session.user.id);

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });

  const addEventMutation = useMutation({
    mutationFn: async (event: Omit<CalendarEvent, 'id'>) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('יש להתחבר כדי להוסיף אירוע');
      }

      const { error } = await supabase
        .from('calendar_events')
        .insert([
          {
            ...event,
            user_id: session.session.user.id,
          },
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setIsOpen(false);
      setNewEvent({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        is_all_day: false
      });
      toast.success('האירוע נוסף בהצלחה');
    },
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    const startTime = new Date(selectedDate);
    startTime.setHours(parseInt(newEvent.start_time.split(':')[0]), parseInt(newEvent.start_time.split(':')[1]));

    const endTime = new Date(selectedDate);
    endTime.setHours(parseInt(newEvent.end_time.split(':')[0]), parseInt(newEvent.end_time.split(':')[1]));

    addEventMutation.mutate({
      ...newEvent,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    });
  };

  if (isLoading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">לוח שנה</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>הוסף אירוע</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>הוסף אירוע חדש</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">כותרת</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">תיאור</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">שעת התחלה</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">שעת סיום</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_all_day"
                  checked={newEvent.is_all_day}
                  onCheckedChange={(checked) => setNewEvent({ ...newEvent, is_all_day: checked })}
                />
                <Label htmlFor="is_all_day">כל היום</Label>
              </div>
              <Button type="submit" className="w-full">
                הוסף אירוע
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">אירועים</h3>
        {events.map((event) => (
          <div key={event.id} className="border rounded-lg p-4">
            <h4 className="font-semibold">{event.title}</h4>
            {event.description && <p className="text-gray-600">{event.description}</p>}
            <div className="text-sm text-gray-500 mt-2">
              {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}