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
  },
})
