import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { setupNotifications, registerForPushNotificationsAsync } from '@/services/notifications';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Navigation from './navigation';
import { AuthProvider } from './components/auth/AuthProvider';

export default function App() {
  const [fontsLoaded] = useFonts({
    // Add any custom fonts here if needed
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    setupNotifications();
    registerForPushNotificationsAsync();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </View>
  );
}
