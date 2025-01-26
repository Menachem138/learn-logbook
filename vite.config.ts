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

export default defineConfig(({ mode, command }) => {
  console.log('Vite config mode:', mode);
  console.log('Vite config command:', command);
  console.log('Current directory:', __dirname);
  console.log('Platform:', process.env.VITE_PLATFORM);

  return {
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
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/theme': path.resolve(__dirname, './src/theme'),
        '@/utils': path.resolve(__dirname, './src/utils'),
        '@/services': path.resolve(__dirname, './src/services'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/pages': path.resolve(__dirname, './src/pages'),
        '@/platform': path.resolve(__dirname, './src/platform'),
        '@/integrations': path.resolve(__dirname, './src/integrations'),
        '@/stores': path.resolve(__dirname, './src/stores'),
        ...(process.env.VITE_PLATFORM === 'web' 
          ? Object.entries(platformSpecific.resolve?.alias || {}).reduce((acc, [key, value]) => ({
              ...acc,
              [key]: typeof value === 'string' ? value : value.toString(),
            }), {})
          : {}),
      },
      extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          console.log('Rollup warning:', warning);
          defaultHandler(warning);
        },
      },
    },
    ...platformSpecific,
  };
});
