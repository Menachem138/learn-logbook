import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./components/auth/AuthProvider";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { AppRouter } from './platform/index.web';
import Index from "./pages/Index";
import Login from "./pages/Login";
import './styles/mobile.css';
import { PushNotificationService } from './services/PushNotificationService';
import React from 'react';

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

function App() {
  const isWeb = Platform.OS === 'web';

  React.useEffect(() => {
    const initializeNotifications = async () => {
      if (!isWeb) {
        // Initialize mobile push notifications
        try {
          await PushNotificationService.initialize();
          console.log('Mobile push notifications initialized');
        } catch (error) {
          console.error('Failed to initialize push notifications:', error);
        }
      } else {
        // For web, request notification permissions
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Web notifications permission granted');
          }
        }
      }
    };

    initializeNotifications();
  }, [isWeb]);

  if (isWeb) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <AppRouter />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <NavigationContainer>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <Stack.Navigator>
              <Stack.Screen 
                name="Home" 
                component={Index}
                options={{
                  headerShown: false
                }}
              />
              <Stack.Screen 
                name="Login" 
                component={Login}
                options={{
                  headerShown: false
                }}
              />
            </Stack.Navigator>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </NavigationContainer>
  );
}

export default App;
