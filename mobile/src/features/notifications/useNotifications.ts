import { useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthProvider';
import { notificationService } from './NotificationService';
import * as Notifications from 'expo-notifications';

export const useNotifications = () => {
  const { session } = useAuth();

  const registerForPushNotifications = useCallback(async () => {
    if (!session?.user) return null;
    return await notificationService.registerForPushNotifications(session.user.id);
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      registerForPushNotifications();
    }
  }, [session?.user, registerForPushNotifications]);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification interaction here
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return {
    registerForPushNotifications,
    scheduleLocalNotification: notificationService.scheduleLocalNotification,
  };
};
