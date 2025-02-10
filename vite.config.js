import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInclude: ['**/*.m4a', '**/*.mp3', '**/*.json'],
    rollupOptions: {
      input: {
        main: 'dist/index.html'
      }
    }
  },
  server: {
    port: 8000,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
});
