import path from 'node:path';

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    path.resolve(
      __dirname,
      '../../packages/min-design-system/src/**/*.{ts,tsx,js,jsx}'
    ),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['MinSans', 'Min Sans VF', 'sans-serif'],
      },
    },
  },
};

export default config;
