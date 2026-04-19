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
          DEFAULT: '#0A0A0B',
          soft: '#111114',
          muted: '#6B7280',
        },
        accent: {
          DEFAULT: '#0F172A',
        },
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(ellipse at top, rgba(0,0,0,0.08), transparent 60%)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
        card: '0 1px 0 rgba(15,23,42,0.04), 0 12px 40px rgba(15,23,42,0.08)',
        glow: '0 10px 60px -10px rgba(15,23,42,0.35)',
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
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-in': 'fade-in 0.8s ease-out both',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
