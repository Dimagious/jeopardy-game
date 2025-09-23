import * as Sentry from '@sentry/react'

// Analytics events as defined in the backlog
export type AnalyticsEvent = 
  | 'game_start'
  | 'board_select'
  | 'judge'
  | 'buzz_first'
  | 'login'
  | 'host_page_view'
  | 'screen_page_view'
  | 'export_results'

interface AnalyticsEventData {
  gameId?: string
  questionId?: string
  teamId?: string
  playerId?: string
  correct?: boolean
  delta?: number
  eventCount?: number
  [key: string]: string | number | boolean | undefined
}

class Analytics {
  private isEnabled: boolean

  constructor() {
    this.isEnabled = import.meta.env.VITE_SENTRY_ENABLED === 'true' || import.meta.env.PROD
  }

  track(event: AnalyticsEvent, data?: AnalyticsEventData) {
    if (!this.isEnabled) {
      console.log(`[Analytics] ${event}`, data)
      return
    }

    // Send to Sentry as custom event
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: event,
      data: data || {},
      level: 'info',
    })

    // In the future, this could also send to PostHog/GA4
    // posthog.capture(event, data)
  }

  // Convenience methods for common events
  gameStart(gameId: string) {
    this.track('game_start', { gameId })
  }

  boardSelect(gameId: string, questionId: string) {
    this.track('board_select', { gameId, questionId })
  }

  judge(gameId: string, questionId: string, teamId: string, correct: boolean, delta: number) {
    this.track('judge', { gameId, questionId, teamId, correct, delta })
  }

  buzzFirst(gameId: string, playerId: string) {
    this.track('buzz_first', { gameId, playerId })
  }

  login() {
    this.track('login')
  }

  hostPageView(gameId: string) {
    this.track('host_page_view', { gameId })
  }

  screenPageView(gameId: string) {
    this.track('screen_page_view', { gameId })
  }

  exportResults(gameId: string, eventCount: number) {
    this.track('export_results', { gameId, eventCount })
  }
}

export const analytics = new Analytics()
