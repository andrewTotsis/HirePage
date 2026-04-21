import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0f172a',
          soft: '#1e293b',
          muted: '#64748b',
        },
        sky: {
          soft: '#eff6ff',
          line: '#dbeafe',
          accent: '#3b82f6',
          deep: '#1d4ed8',
        },
      },
      backgroundImage: {
        'hero-wash':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12), transparent 70%)',
        'soft-grid':
          'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
        card: '0 1px 0 rgba(15,23,42,0.04), 0 12px 40px rgba(15,23,42,0.08)',
        ring: '0 0 0 1px rgba(59,130,246,0.2), 0 8px 24px rgba(59,130,246,0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-in': 'fade-in 0.8s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
