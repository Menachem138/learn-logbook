import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@mobile/providers/AuthProvider';
import { ThemeProvider } from '@mobile/providers/ThemeProvider';
import StudyTimerScreen from '@mobile/screens/StudyTimerScreen';
import LearningJournalScreen from '@mobile/screens/LearningJournalScreen';
import CalendarScreen from '@mobile/screens/CalendarScreen';
import CourseScheduleScreen from '@mobile/screens/CourseScheduleScreen';
import ChatAssistantScreen from '@mobile/screens/ChatAssistantScreen';
import DocumentsScreen from '@mobile/screens/DocumentsScreen';
import type { RootStackParamList } from '@mobile/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="StudyTimer"
              screenOptions={{
                headerShown: true,
                headerTitleAlign: 'center',
              }}
            >
              <Stack.Screen 
                name="StudyTimer" 
                component={StudyTimerScreen}
                options={{ title: 'טיימר למידה' }}
              />
              <Stack.Screen 
                name="LearningJournal" 
                component={LearningJournalScreen}
                options={{ title: 'יומן למידה' }}
              />
              <Stack.Screen 
                name="Calendar" 
                component={CalendarScreen}
                options={{ title: 'לוח שנה' }}
              />
              <Stack.Screen 
                name="CourseSchedule" 
                component={CourseScheduleScreen}
                options={{ title: 'מערכת שעות' }}
              />
              <Stack.Screen 
                name="ChatAssistant" 
                component={ChatAssistantScreen}
                options={{ title: 'עוזר למידה' }}
              />
              <Stack.Screen 
                name="Documents" 
                component={DocumentsScreen}
                options={{ title: 'מסמכים' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
