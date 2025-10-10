import path from 'node:path';

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    path.resolve(
      __dirname,
      '../../packages/min-design-system/src/**/*.{ts,tsx,js,jsx}',
    ),
  ],
};

export default config;
