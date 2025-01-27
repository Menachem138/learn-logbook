import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Force RTL
I18nManager.forceRTL(true);

type DaySchedule = {
  day: string;
  tasks: Array<{
    id: string;
    time: string;
    title: string;
    completed: boolean;
  }>;
};

const mockSchedule: DaySchedule[] = [
  {
    day: 'ראשון',
    tasks: [
      { id: '1', time: '16:00-17:30', title: 'שיעור מבוא', completed: false },
      { id: '2', time: '18:00-19:30', title: 'תרגול', completed: true },
    ],
  },
  {
    day: 'שני',
    tasks: [
      { id: '3', time: '15:00-16:30', title: 'למידה עצמאית', completed: false },
      { id: '4', time: '17:00-18:30', title: 'שיעור מתקדם', completed: false },
    ],
  },
  // Add more days as needed
];

export default function WeeklyScheduleScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>לוח זמנים שבועי</Text>
        {mockSchedule.map((daySchedule) => (
          <View key={daySchedule.day} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{daySchedule.day}</Text>
            {daySchedule.tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskItem, task.completed && styles.completedTask]}
              >
                <View style={styles.taskContent}>
                  <Text style={styles.taskTime}>{task.time}</Text>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                </View>
                <View style={[styles.taskStatus, task.completed && styles.completedStatus]} />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ הוסף משימה</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  dayContainer: {
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTime: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  taskStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
    marginLeft: 8,
  },
  completedTask: {
    opacity: 0.7,
  },
  completedStatus: {
    backgroundColor: '#4CAF50',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
