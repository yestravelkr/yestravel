import path from 'node:path';

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    path.resolve(
      __dirname,
      '../../packages/min-design-system/src/**/*.{ts,tsx,js,jsx}',
    ),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Min Sans VF', 'sans-serif'],
      },
      colors: {
        // Foreground colors
        'fg-neutral': 'var(--fg-neutral)',
        'fg-muted': 'var(--fg-muted)',
        'fg-neutral-inverted': 'var(--fg-neutral-inverted)',
        'fg-on-surface': 'var(--fg-on-surface)',
        'fg-on-surface-subtle': 'var(--fg-on-surface-subtle)',
        'fg-primary': 'var(--fg-primary)',
        'fg-secondary': 'var(--fg-secondary)',
        'fg-critical': 'var(--fg-critical)',
        'fg-placeholder': 'var(--fg-placeholder)',
        'fg-disabled': 'var(--fg-disabled)',

        // Background colors
        'bg-layer': 'var(--bg-layer)',
        'bg-layer-base': 'var(--bg-layer-base)',
        'bg-layer-overlay': 'var(--bg-layer-overlay)',
        'bg-neutral': 'var(--bg-neutral)',
        'bg-neutral-subtle': 'var(--bg-neutral-subtle)',
        'bg-neutral-solid': 'var(--bg-neutral-solid)',
        'bg-neutral-tint': 'var(--bg-neutral-tint)',
        'bg-neutral-glass': 'var(--bg-neutral-glass)',
        'bg-primary': 'var(--bg-primary)',
        'bg-primary-solid': 'var(--bg-primary-solid)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-secondary-solid': 'var(--bg-secondary-solid)',
        'bg-critical': 'var(--bg-critical)',
        'bg-critical-solid': 'var(--bg-critical-solid)',
        'bg-field': 'var(--bg-field)',
        'bg-field-subtle': 'var(--bg-field-subtle)',
        'bg-readonly': 'var(--bg-readonly)',
        'bg-disabled': 'var(--bg-disabled)',
        'bg-transparent': 'var(--bg-transparent)',

        // Note: stroke colors use arbitrary values
        // Example: outline-[var(--stroke-neutral)], border-[var(--stroke-primary)]
      },
    },
  },
};

export default config;
