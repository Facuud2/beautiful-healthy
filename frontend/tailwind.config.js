/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        luxury: {
          bg: '#FAF7F5',
          surface: '#FFFFFF',
          nude: '#F4EBE6',
          gold: '#C5A059',
          goldLight: '#D4AF37',
          blush: '#F9E6E8',
          rose: '#C97A85',
          border: '#E8DDD5',
          cardBorder: '#EFE6DF',
          charcoal: '#2A2421',
          taupe: '#7D726D',
          sageBg: '#E8F3EE',
          sageText: '#3B7A57',
          pendingBg: '#FDF3E7',
          pendingText: '#B8860B',
        },
      },
      boxShadow: {
        'subtle': '0 2px 8px -2px rgba(197, 160, 89, 0.06)',
        'card': '0 4px 16px -2px rgba(197, 160, 89, 0.08)',
        'dropdown': '0 8px 18px -4px rgba(197, 160, 89, 0.12)',
        'gold': '0 4px 14px -2px rgba(197, 160, 89, 0.22)',
      },
    },
  },
  plugins: [],
};