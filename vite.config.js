import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.VITE_DISABLE_AUTH': JSON.stringify(true)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.m4a') || assetInfo.name.endsWith('.mp3')) {
            return 'audio/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    assetsDir: 'assets',
    emptyOutDir: true,
    copyPublicDir: true,
    assetsInclude: ['**/*.m4a', '**/*.mp3', '**/*.json']
  },
  publicDir: 'public',
  server: {
    port: 8000,
    open: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    middlewares: [
      function serveAudio(req, res, next) {
        if (req.url.endsWith('.m4a')) {
          res.setHeader('Content-Type', 'audio/x-m4a');
        }
        next();
      }
    ]
  }
});
