import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import TanStackRouterVite from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      autoCodeSplitting: true,
      routeFileIgnorePattern: '_components',
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@yestravelkr/admin-shared': path.resolve(
        __dirname,
        '../../packages/admin-shared/src',
      ),
      '@yestravelkr/min-design-system': path.resolve(
        __dirname,
        '../../packages/min-design-system/src',
      ),
    },
  },
});
