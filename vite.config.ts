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
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    hmr: false,
  },
  build: {
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('motion')) {
              return 'vendor-motion';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            return 'vendor-libs';
          }
          if (id.includes('src/components/svg/')) {
            return 'smart-svg';
          }
          if (id.includes('src/render/ladaRenderer')) {
            return 'lada-renderer';
          }
          if (id.includes('src/components/LadaCustomIcons')) {
            return 'lada-icons';
          }
          if (id.includes('src/render/marchThawSvgLandscape')) {
            return 'march-thaw-landscape';
          }
        },
      },
    },
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
