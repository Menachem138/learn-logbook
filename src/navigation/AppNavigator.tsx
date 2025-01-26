import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { I18nManager } from 'react-native';
import { NotificationPreferences } from '../components/settings/NotificationPreferences';

import TimerScreen from '../screens/TimerScreen';
import WeeklyScheduleScreen from '../screens/WeeklyScheduleScreen';
import CourseScreen from '../screens/CourseScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import { theme } from '../theme';
import { RootStackParamList } from './types';

// Force RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const Tab = createBottomTabNavigator<RootStackParamList>();

const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface.primary,
    text: theme.colors.text.primary,
    border: theme.colors.border,
  },
};

const getTabIcon = (routeName: string) => {
  switch (routeName) {
    case 'Timer':
      return 'timer';
    case 'WeeklySchedule':
      return 'calendar-week';
    case 'Course':
      return 'book-open-variant';
    case 'Documents':
      return 'file-document-multiple';
    case 'NotificationSettings':
      return 'bell-outline';
    default:
      return 'help';
  }
};

const getTabLabel = (routeName: string) => {
  switch (routeName) {
    case 'Timer':
      return 'טיימר';
    case 'WeeklySchedule':
      return 'לוח זמנים';
    case 'Course':
      return 'קורס';
    case 'Documents':
      return 'מסמכים';
    case 'NotificationSettings':
      return 'התראות';
    default:
      return routeName;
  }
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={NavigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <Icon name={getTabIcon(route.name)} size={size} color={color} />
          ),
          tabBarLabel: getTabLabel(route.name),
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text.secondary,
          headerShown: false,
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.surface.primary,
            paddingBottom: theme.spacing.sm,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: theme.typography.fontSize.caption,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen name="Timer" component={TimerScreen} />
        <Tab.Screen name="WeeklySchedule" component={WeeklyScheduleScreen} />
        <Tab.Screen name="Course" component={CourseScreen} />
        <Tab.Screen name="Documents" component={DocumentsScreen} />
        <Tab.Screen 
          name="NotificationSettings" 
          component={NotificationPreferences}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="bell-outline" size={size} color={color} />
            ),
            tabBarLabel: 'התראות',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
