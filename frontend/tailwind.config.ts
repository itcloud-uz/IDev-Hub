import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F1219',
          secondary: '#151924',
          tertiary: '#1D2333',
        },
        accent: {
          gold: '#D4AF37',
          'gold-light': '#F3E5AB',
          bronze: '#A67C52',
        },
        text: {
          primary: '#F4F4F6',
          secondary: '#9CA3AF',
          muted: '#5A5666',
        },
        border: {
          default: '#242B3D',
          gold: 'rgba(212, 175, 55, 0.3)',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Outfit', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
