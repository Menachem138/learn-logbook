import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export class PushNotificationService {
  static async register() {
    if (Capacitor.getPlatform() === 'web') {
      console.log('Push notifications are not available in web browser');
      return;
    }

    try {
      // Request permission
      const permissionStatus = await PushNotifications.requestPermissions();
      if (permissionStatus.receive === 'granted') {
        // Register with FCM/APNS
        await PushNotifications.register();
      }
    } catch (error) {
      console.error('Error registering push notifications:', error);
    }
  }

  static addListeners() {
    if (Capacitor.getPlatform() === 'web') return;

    // Registration success
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success:', token.value);
    });

    // Registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration:', error);
    });

    // Push notification received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
    });

    // Push notification action clicked
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
    });
  }
}
