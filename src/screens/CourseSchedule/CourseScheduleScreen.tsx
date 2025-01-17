import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase/client';
import { Database } from '../../lib/supabase/types';

type CourseProgress = Database['public']['Tables']['course_progress']['Row'];

export const CourseScheduleScreen: React.FC = () => {
  const [lessons, setLessons] = useState<Array<CourseProgress>>([]);
  const [newLessonId, setNewLessonId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      const { data: progressData, error } = await supabase
        .from('course_progress')
        .select()
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (progressData) {
        setLessons(progressData);
      }
    } catch (error) {
      console.error('Error loading course progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addLesson = async () => {
    if (!newLessonId.trim()) {
      Alert.alert('Error', 'Please enter a lesson ID');
      return;
    }

    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const { data: lesson, error } = await supabase
        .from('course_progress')
        .insert({
          lesson_id: newLessonId.trim(),
          user_id: userId,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      if (lesson) {
        setLessons(currentLessons => [lesson, ...currentLessons]);
        setNewLessonId('');
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      Alert.alert('Error', 'Failed to add lesson');
    }
  };

  const toggleComplete = async (lesson: CourseProgress) => {
    try {
      const { data: updatedLesson, error } = await supabase
        .from('course_progress')
        .update({ completed: !lesson.completed })
        .eq('id', lesson.id)
        .select()
        .single();

      if (error) throw error;
      if (updatedLesson) {
        setLessons(currentLessons => 
          currentLessons.map((l: CourseProgress) => 
            l.id === updatedLesson.id ? updatedLesson : l
          )
        );
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
    }
  };

  const renderItem = ({ item }: { item: CourseProgress }) => (
    <View style={styles.lessonContainer}>
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.checkboxChecked]}
        onPress={() => toggleComplete(item)}
      >
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.lessonContent}>
        <Text style={styles.lessonId}>Lesson {item.lesson_id}</Text>
        <Text style={styles.dateText}>
          Added {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Course Schedule</Text>
      </View>

      <FlatList
        data={lessons}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        refreshing={isLoading}
        onRefresh={loadProgress}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newLessonId}
          onChangeText={setNewLessonId}
          placeholder="Enter lesson ID"
          keyboardType="number-pad"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={addLesson}
          disabled={!newLessonId.trim()}
        >
          <Text style={styles.addButtonText}>Add Lesson</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  lessonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#0284c7',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0284c7',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lessonContent: {
    flex: 1,
  },
  lessonId: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#0284c7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CourseScheduleScreen;
