import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NotificationService } from '../services/NotificationService';

export default function NotificationTestScreen() {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const registerForNotifications = async () => {
      try {
        await NotificationService.registerForPushNotifications();
        setIsRegistered(true);
      } catch (error) {
        console.error('Failed to register for notifications:', error);
        Alert.alert('שגיאה', 'לא הצלחנו לרשום את המכשיר להתראות');
      }
    };

    registerForNotifications();

    const subscription = NotificationService.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const sendTestNotification = async () => {
    try {
      const notificationId = await NotificationService.scheduleLocalNotification(
        'התראת בדיקה',
        'זוהי התראת בדיקה מאפליקציית לוח הלמידה'
      );
      console.log('Test notification scheduled:', notificationId);
    } catch (error) {
      console.error('Failed to send test notification:', error);
      Alert.alert('שגיאה', 'לא הצלחנו לשלוח התראת בדיקה');
    }
  };

  const sendScheduledNotification = async () => {
    try {
      const trigger = new Date(Date.now() + 5 * 1000); // 5 seconds from now
      const notificationId = await NotificationService.scheduleLocalNotification(
        'התראה מתוזמנת',
        'זוהי התראה מתוזמנת שנשלחה לאחר 5 שניות',
        trigger
      );
      console.log('Scheduled notification:', notificationId);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      Alert.alert('שגיאה', 'לא הצלחנו לתזמן התראה');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        סטטוס התראות: {isRegistered ? 'רשום' : 'לא רשום'}
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={sendTestNotification}
      >
        <Text style={styles.buttonText}>שלח התראת בדיקה</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={sendScheduledNotification}
      >
        <Text style={styles.buttonText}>שלח התראה מתוזמנת (5 שניות)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
