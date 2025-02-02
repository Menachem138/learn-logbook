import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/integrations/supabase/client';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });
  }
}

export async function registerForPushNotificationsAsync() {
  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  })).data;

  const { data: session } = await supabase.auth.getSession();
  if (session?.session?.user?.id && token) {
    const { error } = await supabase
      .from('notification_tokens')
      .upsert({
        user_id: session.session.user.id,
        token: token,
        platform: Platform.OS,
      }, {
        onConflict: 'user_id,token',
      });

    if (error) {
      console.error('Error saving notification token:', error);
    }
  }

  return token;
}

export async function scheduleDailyReminder(hour: number, minute: number) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  const trigger = {
    hour,
    minute,
    repeats: true,
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'זמן ללמוד! 📚',
      body: 'הגיע הזמן להמשיך בלימודים שלך. בוא נתקדם יחד!',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger,
  });
}

export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
