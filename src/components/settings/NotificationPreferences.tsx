import React from 'react';
import { View, Switch, Text, StyleSheet, Platform } from 'react-native';
import { PushNotificationService } from '@/services/PushNotificationService';
import { useAuth } from '@/components/auth/AuthProvider';
import { theme } from '@/theme';

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = React.useState<NotificationPreference[]>([
    {
      id: 'course_progress',
      label: 'התקדמות בקורס',
      description: 'קבל התראות על התקדמות והישגים בקורס',
      enabled: true,
    },
    {
      id: 'journal_reminder',
      label: 'תזכורות יומן',
      description: 'קבל תזכורות לעדכון יומן הלמידה',
      enabled: true,
    },
    {
      id: 'study_timer',
      label: 'טיימר למידה',
      description: 'קבל התראות כשהטיימר מסתיים',
      enabled: true,
    },
  ]);

  const handleTogglePreference = async (prefId: string) => {
    if (!user) return;

    try {
      const updatedPreferences = preferences.map(pref => {
        if (pref.id === prefId) {
          return { ...pref, enabled: !pref.enabled };
        }
        return pref;
      });

      setPreferences(updatedPreferences);

      // Update preferences in backend
      await PushNotificationService.updateNotificationPreferences({
        userId: user.id,
        preferences: updatedPreferences.reduce((acc, pref) => ({
          ...acc,
          [pref.id]: pref.enabled,
        }), {}),
      });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      // Revert the change on error
      setPreferences(preferences);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <div className="space-y-6 p-4" dir="rtl">
        <h2 className="text-2xl font-bold text-gray-900">הגדרות התראות</h2>
        {preferences.map((pref) => (
          <div key={pref.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{pref.label}</h3>
              <p className="text-sm text-gray-500">{pref.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pref.enabled}
                onChange={() => handleTogglePreference(pref.id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>הגדרות התראות</Text>
      {preferences.map((pref) => (
        <View key={pref.id} style={styles.preferenceItem}>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{pref.label}</Text>
            <Text style={styles.description}>{pref.description}</Text>
          </View>
          <Switch
            value={pref.enabled}
            onValueChange={() => handleTogglePreference(pref.id)}
            trackColor={{ false: theme.colors.gray[200], true: theme.colors.primary }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.text.primary,
    textAlign: 'right',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'right',
  },
});
