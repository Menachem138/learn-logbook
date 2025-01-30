import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { CalendarView } from './components/Calendar/CalendarView';
import { EventForm } from './components/Calendar/EventForm';
import { Modal } from '@/components/ui/modal';

type Props = NativeStackScreenProps<RootStackParamList, 'Calendar'>;

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'study' | 'exam' | 'assignment';
  user_id: string;
}

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
      return data as CalendarEvent[];
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
        .insert([{ ...event, user_id: session.session.user.id }])
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

  const handleEventSubmit = (eventData: { title: string; date: string; type: 'study' | 'exam' | 'assignment' }) => {
    if (selectedEvent) {
      updateEventMutation.mutate({ ...selectedEvent, ...eventData });
    } else {
      addEventMutation.mutate(eventData);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CalendarView
        events={events}
        onAddEvent={() => {
          setSelectedEvent(null);
          setShowEventForm(true);
        }}
        onSelectEvent={(event) => {
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
