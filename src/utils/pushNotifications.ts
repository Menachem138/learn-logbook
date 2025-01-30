import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function scheduleStudyReminder(minutes: number) {
  const trigger = new Date();
  trigger.setMinutes(trigger.getMinutes() + minutes);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'זמן ללמוד!',
      body: 'הגיע הזמן לחזור ללימודים',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger,
  });
}

export async function scheduleCalendarEventReminder(
  eventTitle: string,
  eventDate: Date,
  minutesBefore: number = 30
) {
  const trigger = new Date(eventDate);
  trigger.setMinutes(trigger.getMinutes() - minutesBefore);

  if (trigger <= new Date()) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'תזכורת אירוע',
      body: `${eventTitle} מתחיל בעוד ${minutesBefore} דקות`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger,
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
