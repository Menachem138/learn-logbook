import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Platform-specific configuration
const platformSpecific = process.env.VITE_PLATFORM === 'web' ? {
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@react-native-async-storage/async-storage': 'react-native-web/dist/exports/AsyncStorage',
      'react-native-safe-area-context': 'react-native-web-safe-area-context',
      '@capacitor/push-notifications': path.resolve(__dirname, './src/platform/web/push-notifications.ts'),
    },
  },
  define: {
    'process.env.DISABLE_MOBILE': JSON.stringify(true),
  },
} : {};

export default defineConfig(({ mode }) => ({
  base: './',  // Updated to work with Capacitor
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      ...(process.env.VITE_PLATFORM === 'web' ? platformSpecific.resolve?.alias || {} : {}),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
  },
  ...platformSpecific,
}));
