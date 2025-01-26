import { supabase } from '@/config/supabase';
import { RealtimeSyncService } from './RealtimeSyncService';

export interface CourseProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  progress_percentage: number;
  last_accessed: string;
  created_at: string;
  updated_at: string;
}

export class CourseService {
  private static syncInitialized = false;

  static async getCourseProgress(userId: string): Promise<CourseProgress[]> {
    try {
      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get course progress:', error);
      throw error;
    }
  }

  static async updateProgress(userId: string, lessonId: string, progress: Partial<CourseProgress>): Promise<void> {
    try {
      const { error } = await supabase
        .from('course_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          ...progress,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update course progress:', error);
      throw error;
    }
  }

  static initializeSync(userId: string, onProgressUpdate: (payload: any) => void): void {
    if (this.syncInitialized) return;
    
    RealtimeSyncService.subscribeToCourseProgress(userId, onProgressUpdate);
    this.syncInitialized = true;
  }

  static cleanup(): void {
    if (!this.syncInitialized) return;
    
    RealtimeSyncService.unsubscribe('course_progress', '*');
    this.syncInitialized = false;
  }
}
