import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { I18nManager } from 'react-native';
import { useTheme } from '../components/theme/ThemeProvider';
import Ionicons from '@expo/vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import JournalScreen from '../screens/JournalScreen';
import SummaryScreen from '../screens/SummaryScreen';

// Enable RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { theme } = useTheme();
  return (
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
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'בית',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
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
    </Tab.Navigator>
  );
}
