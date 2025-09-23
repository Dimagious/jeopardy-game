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
        'screen-lg': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'screen-xl': ['4rem', { lineHeight: '1.1', fontWeight: '800' }],
        'screen-2xl': ['5rem', { lineHeight: '1', fontWeight: '900' }],
        'screen-3xl': ['6rem', { lineHeight: '0.9', fontWeight: '900' }],
        'screen-4xl': ['8rem', { lineHeight: '0.8', fontWeight: '900' }],
        'tv-sm': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'tv-md': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'tv-lg': ['4rem', { lineHeight: '1.1', fontWeight: '800' }],
        'tv-xl': ['5rem', { lineHeight: '1', fontWeight: '900' }],
        'tv-2xl': ['6rem', { lineHeight: '0.9', fontWeight: '900' }],
      },
      animation: {
        'blink': 'blink 0.9s ease-in-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(1.05)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(6, 12, 233, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(6, 12, 233, 0.8), 0 0 30px rgba(6, 12, 233, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
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
  