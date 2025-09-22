/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-2': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-3': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'screen-lg': ['3rem', { lineHeight: '1.2' }],
        'screen-xl': ['4rem', { lineHeight: '1.1' }],
        'screen-2xl': ['5rem', { lineHeight: '1' }],
      },
      animation: {
        'blink': 'blink 0.9s ease-in-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      colors: {
        jeopardy: {
          blue: '#060CE9',
          gold: '#FFD700',
          dark: '#0A0A0A',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
  