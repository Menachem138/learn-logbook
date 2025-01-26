import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WeeklyScheduleScreen } from './mobile/WeeklyScheduleScreen';
import { CourseScreen } from './mobile/CourseScreen';
import { DocumentsScreen } from './mobile/DocumentsScreen';
import { RootStackParamList } from '../navigation/types';

const Tab = createBottomTabNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="WeeklySchedule" component={WeeklyScheduleScreen} />
        <Tab.Screen name="Course" component={CourseScreen} />
        <Tab.Screen name="Documents" component={DocumentsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
