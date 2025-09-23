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
  | 'session_start'
  | 'session_stop'
  | 'player_joined'
  | 'player_left'
  | 'pin_page_view'
  | 'player_page_view'

interface AnalyticsEventData {
  gameId?: string
  questionId?: string
  teamId?: string
  playerId?: string
  sessionId?: string
  pin?: string
  playerName?: string
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

  // Session and player events
  sessionStart(gameId: string, sessionId: string, pin: string) {
    this.track('session_start', { gameId, sessionId, pin })
  }

  sessionStop(gameId: string, sessionId: string) {
    this.track('session_stop', { gameId, sessionId })
  }

  playerJoined(sessionId: string, playerId: string, playerName: string) {
    this.track('player_joined', { sessionId, playerId, playerName })
  }

  playerLeft(sessionId: string, playerId: string) {
    this.track('player_left', { sessionId, playerId })
  }

  pinPageView(pin: string) {
    this.track('pin_page_view', { pin })
  }

  playerPageView(sessionId: string) {
    this.track('player_page_view', { sessionId })
  }

  buzzFirst(sessionId: string, playerId: string, playerName: string) {
    this.track('buzz_first', { sessionId, playerId, playerName })
  }
}

export const analytics = new Analytics()
