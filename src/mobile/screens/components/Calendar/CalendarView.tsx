import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

LocaleConfig.locales['he'] = {
  monthNames: [
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר'
  ],
  monthNamesShort: ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'],
  dayNames: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
  dayNamesShort: ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''],
  today: 'היום'
};

LocaleConfig.defaultLocale = 'he';

interface Event {
  id: string;
  title: string;
  date: string;
  type: 'study' | 'exam' | 'assignment';
}

interface CalendarViewProps {
  events: Event[];
  onAddEvent: () => void;
  onSelectEvent: (event: Event) => void;
}

export function CalendarView({ events, onAddEvent, onSelectEvent }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const markedDates = events.reduce((acc, event) => {
    const color = event.type === 'exam' ? '#ef4444' : event.type === 'assignment' ? '#eab308' : '#22c55e';
    return {
      ...acc,
      [event.date]: {
        marked: true,
        dotColor: color,
        selected: event.date === selectedDate,
        selectedColor: '#f3f4f6'
      }
    };
  }, {});

  const eventsForSelectedDate = events.filter(event => event.date === selectedDate);

  return (
    <View style={styles.container}>
      <RNCalendar
        style={styles.calendar}
        markedDates={markedDates}
        onDayPress={day => setSelectedDate(day.dateString)}
        firstDay={0}
        enableSwipeMonths
        hideExtraDays
      />

      <View style={styles.eventsList}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsTitle}>אירועים</Text>
          <TouchableOpacity onPress={onAddEvent} style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {eventsForSelectedDate.length > 0 ? (
          eventsForSelectedDate.map(event => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventItem}
              onPress={() => onSelectEvent(event)}
            >
              <View style={[styles.eventType, { backgroundColor: getEventColor(event.type) }]} />
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noEvents}>אין אירועים ליום זה</Text>
        )}
      </View>
    </View>
  );
}

const getEventColor = (type: Event['type']) => {
  switch (type) {
    case 'exam':
      return '#ef4444';
    case 'assignment':
      return '#eab308';
    default:
      return '#22c55e';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendar: {
    marginBottom: 16,
  },
  eventsList: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 4,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  eventType: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  eventTitle: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  noEvents: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 16,
  },
});
