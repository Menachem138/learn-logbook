import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';

interface EventFormProps {
  initialEvent?: {
    id?: string;
    title: string;
    date: string;
    type: 'study' | 'exam' | 'assignment';
  };
  onSubmit: (event: { title: string; date: string; type: 'study' | 'exam' | 'assignment' }) => void;
  onCancel: () => void;
}

export function EventForm({ initialEvent, onSubmit, onCancel }: EventFormProps) {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'study' | 'exam' | 'assignment'>(initialEvent?.type || 'study');
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title, date, type });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="כותרת האירוע"
        textAlign="right"
      />

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowCalendar(!showCalendar)}
      >
        <Text style={styles.dateButtonText}>{date}</Text>
      </TouchableOpacity>

      {showCalendar && (
        <Calendar
          style={styles.calendar}
          onDayPress={day => {
            setDate(day.dateString);
            setShowCalendar(false);
          }}
          markedDates={{
            [date]: { selected: true, selectedColor: '#000' }
          }}
          minDate={new Date().toISOString().split('T')[0]}
        />
      )}

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={type}
          onValueChange={(itemValue) => setType(itemValue as 'study' | 'exam' | 'assignment')}
          style={styles.picker}
        >
          <Picker.Item label="למידה" value="study" />
          <Picker.Item label="מבחן" value="exam" />
          <Picker.Item label="מטלה" value="assignment" />
        </Picker>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>
            {initialEvent ? 'עדכן אירוע' : 'צור אירוע'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            ביטול
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
  },
  calendar: {
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#000',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: '#000',
  },
});
