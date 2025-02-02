import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/components/theme/ThemeProvider';
import Ionicons from '@expo/vector-icons/Ionicons';
import TimerScreen from '@/screens/TimerScreen';
import JournalScreen from '@/screens/JournalScreen';
import SummaryScreen from '@/screens/SummaryScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import DocumentsScreen from '@/screens/DocumentsScreen';
import type { TabParamList } from '@/types/navigation';

// Enable RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme === 'dark' ? '#60a5fa' : '#4285f4',
        tabBarInactiveTintColor: theme === 'dark' ? '#9ca3af' : '#6b7280',
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
          borderTopColor: theme === 'dark' ? '#2d2d2d' : '#e5e7eb',
        },
      })}
    >
      <Tab.Screen
        name="Timer"
        component={TimerScreen}
        options={{
          tabBarLabel: 'טיימר',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="timer-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          tabBarLabel: 'יומן',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Summary"
        component={SummaryScreen}
        options={{
          tabBarLabel: 'סיכום',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          tabBarLabel: 'מסמכים',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'הגדרות',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
    </>
  );
}
