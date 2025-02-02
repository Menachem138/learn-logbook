import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Learn Logbook',
  slug: 'learn-logbook',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.learnlogbook.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.learnlogbook.app'
  },
  plugins: [
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#ffffff'
      }
    ]
  ],
  extra: {
    supabaseUrl: 'https://shjwvwhijgehquuteekv.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    eas: {
      projectId: 'learn-time-app'
    }
  },
  updates: {
    url: 'https://u.expo.dev/learn-time-app',
    fallbackToCacheTimeout: 0
  },
  runtimeVersion: {
    policy: 'sdkVersion'
  }
});
