export default {
  name: "learn-logbook-mobile",
  slug: "learn-logbook-mobile",
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
    bundleIdentifier: "com.menachem138.learnlogbook"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.menachem138.learnlogbook"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-localization",
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: "#ffffff"
      }
    ]
  ],
  extra: {
    eas: {
      projectId: "your-project-id"
    }
  }
};
