/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'dark-bg':   '#080E1E',
        'navy':      '#0D1B3E',
        'navy-mid':  '#12234A',
        'card-bg':   '#10193E',
        'input-bg':  '#152142',
        'divider':   '#1E2E52',
        'gold':      '#C9A84C',
        'gold-light':'#E7CB75',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Tamil', 'sans-serif'],
        tamil: ['"Noto Sans Tamil"', 'sans-serif'],
      },
      animation: {
        'fadeIn':    'fadeIn 0.3s ease-out both',
        'slideUp':   'slideUp 0.4s ease-out both',
        'pulseRing': 'pulseRing 1s ease-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(1)',   opacity: '0.8' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
      },
      transitionProperty: {
        'height': 'height',
      },
    },
  },
  plugins: [],
};
