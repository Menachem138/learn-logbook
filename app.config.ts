import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Learn Logbook',
  slug: 'learn-logbook',
  version: '1.0.0',
  owner: 'menachemsamama',
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
      projectId: 'learn-logbook-mobile'
    }
  },
  updates: {
    url: 'https://u.expo.dev/learn-logbook-mobile',
    fallbackToCacheTimeout: 0
  },
  runtimeVersion: {
    policy: 'sdkVersion'
  }
});
