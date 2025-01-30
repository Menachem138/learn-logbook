import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
      "@mobile": path.resolve(__dirname, "./src/mobile"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types"),
    },
  },
  optimizeDeps: {
    exclude: [
      'react-native',
      '@react-native-async-storage/async-storage',
      'expo-notifications',
      'expo-device',
      'expo-constants',
      '@react-native-picker/picker',
      'react-native-web'
    ]
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [
        'react-native',
        '@react-native-async-storage/async-storage',
        'expo-notifications',
        'expo-device',
        'expo-constants',
        '@react-native-picker/picker'
      ]
    }
  },
}));
