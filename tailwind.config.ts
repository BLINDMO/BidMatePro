import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surf: 'rgb(var(--surf) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        elev: 'rgb(var(--elev) / <alpha-value>)',
        amber: '#F5A623',
        'amber-dim': 'rgba(245,166,35,0.14)',
        teal: '#2DD4BF',
        jade: '#22C55E',
        rose: '#F87171',
        sky: '#60A5FA',
        violet: '#C084FC',
        'ink-1': 'rgb(var(--ink-1) / <alpha-value>)',
        'ink-2': 'rgb(var(--ink-2) / <alpha-value>)',
        'ink-3': 'rgb(var(--ink-3) / <alpha-value>)',
        line: 'var(--line)',
        'line-md': 'var(--line-md)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
