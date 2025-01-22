export default {
  name: "Learn Logbook",
  slug: "learn-logbook",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.learnlogbook.app",
    config: {
      googleSignIn: {
        reservedClientId: "YOUR_RESERVED_CLIENT_ID"
      }
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.learnlogbook.app",
    googleServicesFile: "./google-services.json"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-notifications"
  ],
  extra: {
    supabaseUrl: "YOUR_SUPABASE_URL",
    supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
    eas: {
      projectId: "YOUR_EXPO_PROJECT_ID"
    }
  },
  scheme: "learnlogbook"
};
