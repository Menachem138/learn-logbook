import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../integrations/supabase/client';

interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class PushNotificationService {
  private static pushToken: string | null = null;
  private static isInitialized = false;

  static async initialize() {
    if (this.isInitialized) return;
    
    if (Capacitor.getPlatform() === 'web') {
      console.log('Push notifications are not available in web browser');
      return;
    }

    try {
      await this.register();
      this.addListeners();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      throw error;
    }
  }

  static async register() {
    try {
      const permissionStatus = await PushNotifications.requestPermissions();
      
      if (permissionStatus.receive === 'granted') {
        await PushNotifications.register();
        return true;
      } else {
        console.warn('Push notification permissions were denied');
        return false;
      }
    } catch (error) {
      console.error('Error registering push notifications:', error);
      throw error;
    }
  }

  private static async savePushToken(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { error } = await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: user.id,
          push_token: token,
          platform: Capacitor.getPlatform(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving push token:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in savePushToken:', error);
      throw error;
    }
  }

  static addListeners() {
    if (Capacitor.getPlatform() === 'web') return;

    // Registration success
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success');
      this.pushToken = token.value;
      await this.savePushToken(token.value);
    });

    // Registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration:', error);
      this.pushToken = null;
    });

    // Push notification received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received:', notification);
      
      // Handle the notification based on its type
      if (notification.data?.type === 'course_progress') {
        // Emit event for course progress update
        window.dispatchEvent(new CustomEvent('courseProgressUpdate', {
          detail: notification.data
        }));
      } else if (notification.data?.type === 'journal_reminder') {
        // Emit event for journal reminder
        window.dispatchEvent(new CustomEvent('journalReminder', {
          detail: notification.data
        }));
      }
    });

    // Push notification action clicked
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed:', notification);
      
      // Handle notification click based on type
      if (notification.notification.data?.type === 'course_progress') {
        // Navigate to course screen
        window.location.href = '/course';
      } else if (notification.notification.data?.type === 'journal_reminder') {
        // Navigate to journal screen
        window.location.href = '/journal';
      }
    });
  }

  static async sendNotification(userId: string, notification: NotificationData) {
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: userId,
          notification
        }
      });

      if (error) {
        console.error('Error sending notification:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in sendNotification:', error);
      throw error;
    }
  }

  static async removeToken() {
    if (!this.pushToken) return;

    try {
      const { error } = await supabase
        .from('user_push_tokens')
        .delete()
        .eq('push_token', this.pushToken);

      if (error) {
        console.error('Error removing push token:', error);
        throw error;
      }

      this.pushToken = null;
    } catch (error) {
      console.error('Error in removeToken:', error);
      throw error;
    }
  }
}
