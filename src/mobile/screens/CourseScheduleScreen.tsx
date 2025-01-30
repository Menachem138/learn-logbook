import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@mobile/services/supabase';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { Database } from '@/types/supabase';
import { CourseCard } from './components/CourseSchedule/CourseCard';
import { CourseForm } from './components/CourseSchedule/CourseForm';
import { Modal } from '../components/ui/Modal';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseSchedule'>;
type Course = Database['public']['Tables']['courses']['Row'];
type CourseInsert = Database['public']['Tables']['courses']['Insert'];
type CourseUpdate = Database['public']['Tables']['courses']['Update'];

export default function CourseScheduleScreen({ navigation }: Props) {
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('יש להתחבר כדי לצפות בקורסים');
      }

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('title', { ascending: true });

      if (error) throw error;
      return data as Course[];
    },
  });

  const addCourseMutation = useMutation({
    mutationFn: async (course: Omit<CourseInsert, 'user_id' | 'progress'>) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('יש להתחבר כדי ליצור קורס');
      }

      const { data, error } = await supabase
        .from('courses')
        .insert([{ ...course, progress: 0, user_id: session.session.user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowCourseForm(false);
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async (course: Course) => {
      const { error } = await supabase
        .from('courses')
        .update({
          title: course.title,
          schedule: course.schedule,
          total_units: course.total_units,
        })
        .eq('id', course.id)
        .eq('user_id', course.user_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowCourseForm(false);
      setSelectedCourse(null);
    },
  });

  const handleCourseSubmit = (courseData: { title: string; schedule: { day: string; time: string; }[]; total_units: number; }) => {
    if (selectedCourse) {
      updateCourseMutation.mutate({ ...selectedCourse, ...courseData });
    } else {
      addCourseMutation.mutate(courseData);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onPress={() => {
                setSelectedCourse(course);
                setShowCourseForm(true);
              }}
            />
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showCourseForm}
        onClose={() => {
          setShowCourseForm(false);
          setSelectedCourse(null);
        }}
        title={selectedCourse ? 'ערוך קורס' : 'הוסף קורס חדש'}
      >
        <CourseForm
          initialCourse={selectedCourse || undefined}
          onSubmit={handleCourseSubmit}
          onCancel={() => {
            setShowCourseForm(false);
            setSelectedCourse(null);
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});
