import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Learn Logbook',
  slug: 'learn-logbook',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'app.lovable.learnlogbook'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'app.lovable.learnlogbook'
  },
  plugins: [
    'expo-notifications'
  ],
  extra: {
    eas: {
      projectId: 'your-project-id'
    }
  }
};

export default config;
