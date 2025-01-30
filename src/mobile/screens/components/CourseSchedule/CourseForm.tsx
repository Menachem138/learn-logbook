import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

interface CourseFormProps {
  initialCourse?: {
    id?: string;
    title: string;
    schedule: {
      day: string;
      time: string;
    }[];
    total_units: number;
  };
  onSubmit: (course: { title: string; schedule: { day: string; time: string; }[]; total_units: number; }) => void;
  onCancel: () => void;
}

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];

export function CourseForm({ initialCourse, onSubmit, onCancel }: CourseFormProps) {
  const [title, setTitle] = useState(initialCourse?.title || '');
  const [schedule, setSchedule] = useState<{ day: string; time: string; }[]>(
    initialCourse?.schedule || []
  );
  const [totalUnits, setTotalUnits] = useState(initialCourse?.total_units?.toString() || '');

  const addScheduleSlot = () => {
    setSchedule([...schedule, { day: DAYS[0], time: '08:00' }]);
  };

  const removeScheduleSlot = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateScheduleSlot = (index: number, field: 'day' | 'time', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const handleSubmit = () => {
    if (!title.trim() || !totalUnits || schedule.length === 0) return;
    onSubmit({
      title: title.trim(),
      schedule,
      total_units: parseInt(totalUnits, 10),
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="שם הקורס"
        textAlign="right"
      />

      <TextInput
        style={styles.input}
        value={totalUnits}
        onChangeText={(text) => setTotalUnits(text.replace(/[^0-9]/g, ''))}
        placeholder="מספר יחידות"
        keyboardType="numeric"
        textAlign="right"
      />

      <View style={styles.scheduleSection}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.sectionTitle}>מערכת שעות</Text>
          <TouchableOpacity onPress={addScheduleSlot} style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {schedule.map((slot, index) => (
          <View key={index} style={styles.scheduleSlot}>
            <TouchableOpacity
              onPress={() => removeScheduleSlot(index)}
              style={styles.removeButton}
            >
              <Ionicons name="close-circle" size={20} color="#ef4444" />
            </TouchableOpacity>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={slot.day}
                onValueChange={(value) => updateScheduleSlot(index, 'day', value)}
                style={styles.picker}
              >
                {DAYS.map((day) => (
                  <Picker.Item key={day} label={day} value={day} />
                ))}
              </Picker>
            </View>

            <TextInput
              style={styles.timeInput}
              value={slot.time}
              onChangeText={(value) => updateScheduleSlot(index, 'time', value)}
              placeholder="שעה"
              textAlign="right"
            />
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>
            {initialCourse ? 'עדכן קורס' : 'הוסף קורס'}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  scheduleSection: {
    marginBottom: 24,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    padding: 4,
  },
  scheduleSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  removeButton: {
    padding: 4,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
  },
  timeInput: {
    width: 80,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
