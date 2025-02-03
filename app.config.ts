import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Learn Logbook',
  slug: 'learn-logbook',
  owner: 'menachems',
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
    'expo-notifications'
  ],
  runtimeVersion: {
    policy: "appVersion"
  },
  updates: {
    enabled: true,
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 0
  },
  extra: {
    eas: {
      projectId: "learn-logbook"
    }
  },
  owner: "menachems",
  developmentClient: {
    silentLaunch: true
  },
  extra: {
    supabaseUrl: 'https://shjwvwhijgehquuteekv.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    eas: {
      projectId: 'learn-logbook'
    }
  }
};

export default config;
