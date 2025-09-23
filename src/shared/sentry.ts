import * as Sentry from '@sentry/react'

// Initialize Sentry only in production or when explicitly enabled
const isProduction = import.meta.env.PROD
const sentryEnabled = import.meta.env.VITE_SENTRY_ENABLED === 'true'

if (isProduction || sentryEnabled) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: isProduction ? 0.1 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    beforeSend(event) {
      // Filter out development errors in production
      if (isProduction && event.exception) {
        const error = event.exception.values?.[0]
        if (error?.value?.includes('localhost') || error?.value?.includes('127.0.0.1')) {
          return null
        }
      }
      return event
    },
  })
}

export default Sentry
