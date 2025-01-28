import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabaseMobile } from '../../integrations/supabase/client';
import { NotificationPermissionStatus } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    if (!Device.isDevice) {
      return 'denied';
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    return existingStatus;
  }

  async requestPermissions(): Promise<NotificationPermissionStatus> {
    if (!Device.isDevice) {
      return 'denied';
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  }

  async registerForPushNotifications(userId: string): Promise<string | null> {
    try {
      const status = await this.requestPermissions();
      if (status !== 'granted') {
        console.log('Permission not granted for notifications');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      const deviceId = Device.modelId ?? 'unknown';

      // Store token in Supabase
      const { error } = await supabaseMobile
        .from('notification_tokens')
        .upsert({
          user_id: userId,
          token,
          device_id: deviceId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,device_id'
        });

      if (error) {
        console.error('Error storing notification token:', error);
        return null;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  async unregisterPushNotifications(userId: string): Promise<void> {
    try {
      const deviceId = Device.modelId ?? 'unknown';
      
      await supabaseMobile
        .from('notification_tokens')
        .delete()
        .match({ user_id: userId, device_id: deviceId });
    } catch (error) {
      console.error('Error unregistering push notifications:', error);
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput = null
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });
  }
}

export const notificationService = NotificationService.getInstance();
