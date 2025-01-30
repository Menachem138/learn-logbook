import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    schedule: {
      day: string;
      time: string;
    }[];
    progress: number;
    total_units: number;
  };
  onPress: () => void;
}

export function CourseCard({ course, onPress }: CourseCardProps) {
  const progressPercentage = (course.progress / course.total_units) * 100;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{course.title}</Text>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </View>

      <View style={styles.scheduleContainer}>
        {course.schedule.map((slot, index) => (
          <View key={`${slot.day}-${slot.time}-${index}`} style={styles.scheduleItem}>
            <Text style={styles.scheduleDay}>{slot.day}</Text>
            <Text style={styles.scheduleTime}>{slot.time}</Text>
          </View>
        ))}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {course.progress} / {course.total_units} יחידות הושלמו
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
  },
  scheduleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  scheduleItem: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    flexDirection: 'row',
    gap: 4,
  },
  scheduleDay: {
    fontSize: 12,
    color: '#374151',
  },
  scheduleTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
});
