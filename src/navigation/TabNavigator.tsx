import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { StudyTimerScreen } from '../screens/StudyTimer/StudyTimerScreen';
import { LearningJournalScreen } from '../screens/LearningJournal/LearningJournalScreen';
import { LibraryScreen } from '../screens/Library/LibraryScreen';
import { CourseScheduleScreen } from '../screens/CourseSchedule/CourseScheduleScreen';
import { ChatScreen } from '../screens/Chat/ChatScreen';
import type { TabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  const { supabase } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerRight: () => (
          <TouchableOpacity
            onPress={async () => {
              await supabase.auth.signOut();
            }}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="log-out-outline" size={24} color="#0284c7" />
          </TouchableOpacity>
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'StudyTimer':
              iconName = focused ? 'timer' : 'timer-outline';
              break;
            case 'LearningJournal':
              iconName = focused ? 'journal' : 'journal-outline';
              break;
            case 'Library':
              iconName = focused ? 'library' : 'library-outline';
              break;
            case 'CourseSchedule':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Chat':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="StudyTimer" 
        component={StudyTimerScreen}
        options={{ title: 'Timer' }}
      />
      <Tab.Screen 
        name="LearningJournal" 
        component={LearningJournalScreen}
        options={{ title: 'Journal' }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen}
        options={{ title: 'Library' }}
      />
      <Tab.Screen 
        name="CourseSchedule" 
        component={CourseScheduleScreen}
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: 'Q&A' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
