import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="StudyTimer">
        <Stack.Screen 
          name="StudyTimer" 
          getComponent={() => require('../screens/StudyTimerScreen').default}
          options={{ title: 'Study Timer' }}
        />
        <Stack.Screen 
          name="LearningJournal" 
          getComponent={() => require('../screens/LearningJournalScreen').default}
          options={{ title: 'Learning Journal' }}
        />
        <Stack.Screen 
          name="Calendar" 
          getComponent={() => require('../screens/CalendarScreen').default}
          options={{ title: 'Calendar' }}
        />
        <Stack.Screen 
          name="CourseSchedule" 
          getComponent={() => require('../screens/CourseScheduleScreen').default}
          options={{ title: 'Course Schedule' }}
        />
        <Stack.Screen 
          name="ChatAssistant" 
          getComponent={() => require('../screens/ChatAssistantScreen').default}
          options={{ title: 'Chat Assistant' }}
        />
        <Stack.Screen 
          name="Documents" 
          getComponent={() => require('../screens/DocumentsScreen').default}
          options={{ title: 'Documents' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
