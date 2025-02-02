import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { AddEventModal } from '@/components/Calendar/AddEventModal.native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import type { CalendarEvent } from '@/types/calendar';

export default function WeeklyScheduleScreen() {
  const toggleEventCompletion = async (event: CalendarEvent) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({ completed: !event.completed })
        .eq('id', event.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    } catch (error) {
      console.error('Error toggling event completion:', error);
      Toast.show({
        type: 'error',
        text1: 'שגיאה',
        text2: 'שגיאה בעדכון סטטוס האירוע',
        position: 'bottom',
      });
    }
  };
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const styles = getStyles(theme);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

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
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });

  const getWeekDays = () => {
    const days = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>טוען לוח זמנים...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>לוח זמנים שבועי</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekContainer}>
          {getWeekDays().map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                isToday(date) && styles.todayContainer,
                date.toDateString() === selectedDate.toDateString() && styles.selectedDayContainer
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[
                styles.dayText,
                isToday(date) && styles.todayText,
                date.toDateString() === selectedDate.toDateString() && styles.selectedDayText
              ]}>
                {formatDate(date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.eventsContainer}>
          {getEventsForDate(selectedDate).map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.is_backup && (
                  <View style={styles.backupBadge}>
                    <Text style={styles.backupText}>גיבוי</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.eventTime}>
                {new Date(event.start_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(event.end_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              
              {event.description && (
                <Text style={styles.eventDescription}>{event.description}</Text>
              )}
              
              <View style={styles.eventFooter}>
                <Text style={[styles.eventCategory, { backgroundColor: getCategoryColor(event.category) }]}>
                  {event.category}
                </Text>
                
                <TouchableOpacity 
                  style={[styles.completeButton, event.completed && styles.completedButton]}
                  onPress={() => toggleEventCompletion(event)}
                >
                  <Ionicons 
                    name={event.completed ? "checkmark-circle" : "checkmark-circle-outline"} 
                    size={24} 
                    color={event.completed ? "#10b981" : theme === 'dark' ? "#9ca3af" : "#6b7280"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <AddEventModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onEventAdded={() => {
          queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        }}
      />
    </SafeAreaView>
  );
}

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'לימודים': '#3b82f6',
    'עבודה': '#ef4444',
    'אישי': '#10b981',
    'אחר': '#8b5cf6',
  };
  return colors[category] || colors['אחר'];
};

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 24,
    color: theme === 'dark' ? '#fff' : '#000',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  weekContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayContainer: {
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
    minWidth: 80,
  },
  selectedDayContainer: {
    backgroundColor: '#4285f4',
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: '#4285f4',
  },
  dayText: {
    fontSize: 14,
    textAlign: 'center',
    color: theme === 'dark' ? '#fff' : '#000',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  todayText: {
    fontWeight: '600',
  },
  eventsContainer: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme === 'dark' ? '#fff' : '#000',
    textAlign: 'right',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  backupBadge: {
    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  backupText: {
    fontSize: 12,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  eventTime: {
    fontSize: 14,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    marginBottom: 8,
    textAlign: 'right',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  eventDescription: {
    fontSize: 14,
    color: theme === 'dark' ? '#d1d5db' : '#4b5563',
    marginBottom: 12,
    textAlign: 'right',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventCategory: {
    fontSize: 12,
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  completeButton: {
    padding: 4,
  },
  completedButton: {
    opacity: 0.8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4285f4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    color: theme === 'dark' ? '#fff' : '#000',
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
});
