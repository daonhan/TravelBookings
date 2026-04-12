import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/bookings': {
        target: 'https://localhost:61060',
        secure: false,
        changeOrigin: true,
      },
      '/api/events': {
        target: 'https://localhost:61056',
        secure: false,
        changeOrigin: true,
      },
      '/api/payments': {
        target: 'https://localhost:61054',
        secure: false,
        changeOrigin: true,
      },
      '/api/reports': {
        target: 'https://localhost:61058',
        secure: false,
        changeOrigin: true,
      },
      '/api/notifications': {
        target: 'https://localhost:61061',
        secure: false,
        changeOrigin: true,
      },
      '/hubs': {
        target: 'https://localhost:61061',
        secure: false,
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          router: ['@tanstack/react-router'],
          charts: ['@tremor/react'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    css: true,
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
