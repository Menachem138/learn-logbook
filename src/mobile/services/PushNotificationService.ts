import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../config/supabase';

export class PushNotificationService {
  static async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications are only available on native platforms');
      return;
    }

    try {
      // Request permission to use push notifications
      const permissionStatus = await PushNotifications.requestPermissions();
      if (permissionStatus.receive !== 'granted') {
        throw new Error('User denied push notification permissions');
      }

      // Register with native push notifications service
      await PushNotifications.register();

      // Add listeners for push notifications
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success:', token.value);
        await this.savePushToken(token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
        // Handle the notification when the app is in foreground
        this.handleNotification(notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
        // Handle the notification when the app is in background/killed
        this.handleNotificationAction(notification);
      });

    } catch (error) {
      console.error('Error initializing push notifications:', error);
      throw error;
    }
  }

  private static async savePushToken(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: user.id,
          push_token: token,
          device_type: Capacitor.getPlatform(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving push token:', error);
      throw error;
    }
  }

  private static handleNotification(notification: any) {
    // Handle different types of notifications
    const { title, body, data } = notification;

    switch (data?.type) {
      case 'COURSE_UPDATE':
        // Handle course update notification
        break;
      case 'TIMER_COMPLETE':
        // Handle timer completion notification
        break;
      case 'SCHEDULE_REMINDER':
        // Handle schedule reminder notification
        break;
      default:
        // Handle generic notification
        console.log('Received notification:', { title, body, data });
    }
  }

  private static handleNotificationAction(actionData: any) {
    const { notification } = actionData;
    const { data } = notification;

    switch (data?.type) {
      case 'COURSE_UPDATE':
        // Navigate to course screen
        break;
      case 'TIMER_COMPLETE':
        // Navigate to timer screen
        break;
      case 'SCHEDULE_REMINDER':
        // Navigate to schedule screen
        break;
      default:
        // Handle generic action
        console.log('Notification action performed:', actionData);
    }
  }

  static async removePushToken() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_push_tokens')
        .delete()
        .match({ user_id: user.id });

      if (error) throw error;
    } catch (error) {
      console.error('Error removing push token:', error);
      throw error;
    }
  }
}
