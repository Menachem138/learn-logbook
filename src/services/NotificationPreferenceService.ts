import { supabase } from '@/config/supabase';

export interface NotificationPreference {
  course_progress: boolean;
  journal_reminder: boolean;
  study_timer: boolean;
}

export class NotificationPreferenceService {
  static async getPreferences(userId: string): Promise<NotificationPreference | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      throw error;
    }
  }

  static async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreference>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  static async createDefaultPreferences(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: userId,
          course_progress: true,
          journal_reminder: true,
          study_timer: true
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to create default notification preferences:', error);
      throw error;
    }
  }
}
