import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#090C15',
        surf: '#0F1525',
        card: '#162035',
        elev: '#1C2840',
        amber: '#F5A623',
        'amber-dim': 'rgba(245,166,35,0.14)',
        teal: '#2DD4BF',
        jade: '#22C55E',
        rose: '#F87171',
        sky: '#60A5FA',
        violet: '#C084FC',
        'ink-1': '#F0F4FF',
        'ink-2': '#8896B3',
        'ink-3': '#4B5875',
        line: 'rgba(255,255,255,0.05)',
        'line-md': 'rgba(255,255,255,0.09)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
