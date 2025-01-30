import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@mobile/services/supabase';
import { scheduleCalendarEventReminder, registerForPushNotificationsAsync } from '@mobile/utils/pushNotifications';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { Database } from '@/types/supabase';
import { CalendarView } from './components/Calendar/CalendarView';
import { EventForm } from './components/Calendar/EventForm';
import { Modal } from '../components/ui/Modal';

type Props = NativeStackScreenProps<RootStackParamList, 'Calendar'>;
type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'] & {
  type: 'study' | 'exam' | 'assignment';
  date: string;
};

export default function CalendarScreen({ navigation }: Props) {
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
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
        .eq('user_id', session.session.user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      return data.map(item => ({
        ...item,
        date: item.start_time.split('T')[0],
        type: item.description?.includes('exam') ? 'exam' : 
              item.description?.includes('assignment') ? 'assignment' : 'study'
      }));
    },
  });

  const addEventMutation = useMutation({
    mutationFn: async (event: Omit<CalendarEvent, 'id' | 'user_id'>) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('יש להתחבר כדי ליצור אירוע');
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          title: event.title,
          start_time: event.date,
          end_time: new Date(new Date(event.date).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
          description: event.type,
          is_all_day: false,
          user_id: session.session.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setShowEventForm(false);
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (event: CalendarEvent) => {
      const { error } = await supabase
        .from('calendar_events')
        .update({ title: event.title, date: event.date, type: event.type })
        .eq('id', event.id)
        .eq('user_id', event.user_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setShowEventForm(false);
      setSelectedEvent(null);
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
      setSelectedEvent(null);
    },
  });

  const handleEventSubmit = async (eventData: { title: string; date: string; type: 'study' | 'exam' | 'assignment' }) => {
    const newEvent: Omit<CalendarEvent, 'id' | 'user_id'> = {
      title: eventData.title,
      date: eventData.date,
      type: eventData.type,
      start_time: eventData.date,
      end_time: new Date(new Date(eventData.date).getTime() + 60 * 60 * 1000).toISOString(),
      description: eventData.type,
      is_all_day: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (selectedEvent) {
      await updateEventMutation.mutateAsync({ ...selectedEvent, ...newEvent });
      await scheduleCalendarEventReminder(eventData.title, new Date(eventData.date));
    } else {
      await addEventMutation.mutateAsync(newEvent);
      await scheduleCalendarEventReminder(eventData.title, new Date(eventData.date));
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <CalendarView
        events={events}
        onAddEvent={() => {
          setSelectedEvent(null);
          setShowEventForm(true);
        }}
        onSelectEvent={(event: CalendarEvent) => {
          setSelectedEvent(event);
          setShowEventForm(true);
        }}
      />

      <Modal
        visible={showEventForm}
        onClose={() => {
          setShowEventForm(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent ? 'ערוך אירוע' : 'צור אירוע חדש'}
      >
        <EventForm
          initialEvent={selectedEvent || undefined}
          onSubmit={handleEventSubmit}
          onCancel={() => {
            setShowEventForm(false);
            setSelectedEvent(null);
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
