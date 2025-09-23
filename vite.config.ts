import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Sentry plugin only in production builds
    process.env.NODE_ENV === 'production' && process.env.VITE_SENTRY_DSN
      ? sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          sourcemaps: {
            assets: './dist/**',
          },
        })
      : null,
  ].filter(Boolean),
  build: {
    sourcemap: process.env.NODE_ENV === 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'zustand-vendor': ['zustand'],
          'tailwind-vendor': ['tailwindcss'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'zod'],
          // App chunks
          'game-store': ['./src/shared/gameStore.ts', './src/shared/events.ts'],
          'components': ['./src/components/Board.tsx', './src/components/HostPanel.tsx', './src/components/Screen.tsx'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
  },
})
