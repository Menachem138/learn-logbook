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
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        { find: '@/components', replacement: path.resolve(__dirname, 'src/components') },
        { find: '@/theme', replacement: path.resolve(__dirname, 'src/theme') },
        ...(process.env.VITE_PLATFORM === 'web' 
          ? Object.entries(platformSpecific.resolve?.alias || {}).map(([find, replacement]) => ({
              find,
              replacement: typeof replacement === 'string' ? replacement : replacement.toString(),
            }))
          : []
        ),
      ],
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
