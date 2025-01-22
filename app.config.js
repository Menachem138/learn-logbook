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
        reservedClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID
      }
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.learnlogbook.app",
    googleServicesFile: "./google-services.json",
    config: {
      googleSignIn: {
        apiKey: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID
      }
    }
  },
  web: {
    favicon: "./assets/favicon.png",
    config: {
      googleSignIn: {
        clientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID
      }
    }
  },
  plugins: [
    "expo-notifications"
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID
    }
  },
  scheme: "learnlogbook"
};
