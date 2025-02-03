import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Learn Logbook',
  slug: 'learn-logbook',
  version: '1.0.0',
  owner: 'menachems',
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
    bundleIdentifier: 'com.menachem.learnlogbook'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.menachem.learnlogbook'
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
  }
};

export default config;
