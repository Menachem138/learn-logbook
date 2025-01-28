import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StudyTimeTracker } from '../features/StudyTimeTracker';
import { useAuth } from '../contexts/AuthProvider';

export type RootStackParamList = {
  Timer: undefined;
  // Add more screens here as we implement them
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function Navigation() {
  const { session } = useAuth();

  if (!session) {
    // TODO: Add authentication screen
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Timer"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f9fafb',
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="Timer"
          component={StudyTimeTracker}
          options={{
            title: 'מעקב זמן למידה',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
