import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client'],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: false,
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.worktrees/**',
      '**/.scratch/**',
      '**/.git/**',
      '**/e2e/**',
    ],
  },
});
