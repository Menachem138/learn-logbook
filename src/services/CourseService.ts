import { supabase } from '../config/supabase';
import { realtimeSync } from './RealtimeSyncService';

export class CourseService {
  static async getCourseProgress(courseId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting course progress:', error);
      throw error;
    }
  }

  static async updateProgress(courseId: string, progress: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          progress,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Subscribe to real-time updates for this course's progress
      realtimeSync.subscribeToTable({
        table: 'course_progress',
        onUpdate: (newData) => {
          if (newData.course_id === courseId && newData.user_id === user.id) {
            // Dispatch event to update UI
            window.dispatchEvent(
              new CustomEvent('courseProgressUpdate', {
                detail: { courseId, progress: newData.progress }
              })
            );
          }
        },
      });
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  }

  static async getAllCourseProgress() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting all course progress:', error);
      throw error;
    }
  }
}
