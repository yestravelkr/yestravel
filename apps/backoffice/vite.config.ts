import { createRequire } from 'node:module';
import path from 'node:path';

import ckeditor5 from '@ckeditor/vite-plugin-ckeditor5';
import tailwindcss from '@tailwindcss/vite';
import TanStackRouterVite from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const require = createRequire(import.meta.url);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      autoCodeSplitting: true,
      routeFileIgnorePattern: '_components',
    }),
    react(),
    tailwindcss(),
    ckeditor5({ theme: require.resolve('@ckeditor/ckeditor5-theme-lark') }),
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@yestravelkr/min-design-system': path.resolve(
        __dirname,
        '../../packages/min-design-system/src',
      ),
    },
  },
});
