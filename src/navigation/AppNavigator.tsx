import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import TimerScreen from '../screens/TimerScreen';
import CourseScreen from '../screens/CourseScreen';
import JournalScreen from '../screens/JournalScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import WeeklyScheduleScreen from '../screens/WeeklyScheduleScreen';
import AssistantScreen from '../screens/AssistantScreen';
import LoginScreen from '../screens/LoginScreen';
import NotificationTestScreen from '../screens/NotificationTestScreen';

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'דף הבית' }}
        />
        <Stack.Screen 
          name="Timer" 
          component={TimerScreen}
          options={{ title: 'טיימר למידה' }}
        />
        <Stack.Screen 
          name="Course" 
          component={CourseScreen}
          options={{ title: 'תוכן הקורס' }}
        />
        <Stack.Screen 
          name="Journal" 
          component={JournalScreen}
          options={{ title: 'יומן למידה' }}
        />
        <Stack.Screen 
          name="Documents" 
          component={DocumentsScreen}
          options={{ title: 'מסמכים' }}
        />
        <Stack.Screen 
          name="WeeklySchedule" 
          component={WeeklyScheduleScreen}
          options={{ title: 'לוח זמנים שבועי' }}
        />
        <Stack.Screen 
          name="Assistant" 
          component={AssistantScreen}
          options={{ title: 'עוזר אישי' }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: 'התחברות' }}
        />
        <Stack.Screen 
          name="NotificationTest" 
          component={NotificationTestScreen}
          options={{ title: 'בדיקת התראות' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
