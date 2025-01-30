import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
              {children}
            </View>
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export function withTheme<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithThemeComponent(props: P) {
    return (
      <ThemeProvider>
        <WrappedComponent {...props} />
      </ThemeProvider>
    );
  };
}
