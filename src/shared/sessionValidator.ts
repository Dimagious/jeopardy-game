/**
 * Session Validator для валидации сессий и игроков
 * Обеспечивает безопасность и предотвращает подделку событий
 */

import { Session, BuzzEvent } from './sessionStore'

export interface ValidationResult {
  valid: boolean
  error?: string
  code?: string
}

export interface SessionValidationContext {
  sessionId: string
  playerId: string
  timestamp: number
  action: string
  metadata?: Record<string, unknown>
}

export class SessionValidator {
  private maxSessionAge: number = 24 * 60 * 60 * 1000 // 24 часа
  private maxPlayerInactivity: number = 30 * 60 * 1000 // 30 минут
  private maxBuzzInterval: number = 1000 // 1 секунда между buzz
  private minBuzzInterval: number = 100 // Минимум 100ms между buzz

  /**
   * Валидирует сессию
   */
  validateSession(session: Session | null): ValidationResult {
    if (!session) {
      return {
        valid: false,
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      }
    }

    // Проверяем, активна ли сессия
    if (!session.isActive) {
      return {
        valid: false,
        error: 'Session is not active',
        code: 'SESSION_INACTIVE'
      }
    }

    // Проверяем возраст сессии
    const sessionAge = Date.now() - new Date(session.createdAt).getTime()
    if (sessionAge > this.maxSessionAge) {
      return {
        valid: false,
        error: 'Session expired',
        code: 'SESSION_EXPIRED'
      }
    }

    return { valid: true }
  }

  /**
   * Валидирует игрока
   */
  validatePlayer(session: Session, playerId: string): ValidationResult {
    const sessionValidation = this.validateSession(session)
    if (!sessionValidation.valid) {
      return sessionValidation
    }

    const player = session.players.find(p => p.id === playerId)
    if (!player) {
      return {
        valid: false,
        error: 'Player not found in session',
        code: 'PLAYER_NOT_FOUND'
      }
    }

    if (!player.isActive) {
      return {
        valid: false,
        error: 'Player is not active',
        code: 'PLAYER_INACTIVE'
      }
    }

    // Проверяем активность игрока
    const playerAge = Date.now() - new Date(player.joinedAt).getTime()
    if (playerAge > this.maxPlayerInactivity) {
      return {
        valid: false,
        error: 'Player inactive too long',
        code: 'PLAYER_INACTIVE_TOO_LONG'
      }
    }

    return { valid: true }
  }

  /**
   * Валидирует buzz событие
   */
  validateBuzzEvent(
    session: Session, 
    playerId: string, 
    buzzEvent: BuzzEvent
  ): ValidationResult {
    const playerValidation = this.validatePlayer(session, playerId)
    if (!playerValidation.valid) {
      return playerValidation
    }

    // Проверяем временную метку
    const now = Date.now()
    const timeDiff = Math.abs(now - buzzEvent.timestamp)
    
    if (timeDiff > 5000) { // Больше 5 секунд разницы
      return {
        valid: false,
        error: 'Buzz event timestamp is invalid',
        code: 'INVALID_TIMESTAMP'
      }
    }

    // Проверяем интервал между buzz событиями
    const recentBuzzEvents = session.buzzState.events.filter(
      event => event.playerId === playerId && 
      now - event.timestamp < this.maxBuzzInterval
    )

    if (recentBuzzEvents.length > 0) {
      return {
        valid: false,
        error: 'Buzz event too frequent',
        code: 'BUZZ_TOO_FREQUENT'
      }
    }

    // Проверяем, не заблокирован ли buzz
    if (session.buzzState.isLocked) {
      return {
        valid: false,
        error: 'Buzz is currently locked',
        code: 'BUZZ_LOCKED'
      }
    }

    return { valid: true }
  }

  /**
   * Валидирует контекст действия
   */
  validateActionContext(context: SessionValidationContext): ValidationResult {
    // Проверяем обязательные поля
    if (!context.sessionId || !context.playerId) {
      return {
        valid: false,
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      }
    }

    // Проверяем временную метку
    const now = Date.now()
    const timeDiff = Math.abs(now - context.timestamp)
    
    if (timeDiff > 10000) { // Больше 10 секунд разницы
      return {
        valid: false,
        error: 'Action timestamp is too old',
        code: 'TIMESTAMP_TOO_OLD'
      }
    }

    // Проверяем действие
    const allowedActions = ['buzz', 'join', 'leave', 'assign_team']
    if (!allowedActions.includes(context.action)) {
      return {
        valid: false,
        error: 'Invalid action',
        code: 'INVALID_ACTION'
      }
    }

    return { valid: true }
  }

  /**
   * Проверяет подозрительную активность
   */
  detectSuspiciousActivity(session: Session, playerId: string): ValidationResult {
    const player = session.players.find(p => p.id === playerId)
    if (!player) {
      return { valid: true } // Игрок не найден - не подозрительно
    }

    const now = Date.now()
    const recentBuzzEvents = session.buzzState.events.filter(
      event => event.playerId === playerId && 
      now - event.timestamp < 60000 // Последняя минута
    )

    // Слишком много buzz событий
    if (recentBuzzEvents.length > 10) {
      return {
        valid: false,
        error: 'Too many buzz events detected',
        code: 'SUSPICIOUS_ACTIVITY'
      }
    }

    // Проверяем паттерн buzz событий
    const buzzTimes = recentBuzzEvents.map(e => e.timestamp).sort()
    for (let i = 1; i < buzzTimes.length; i++) {
      const interval = buzzTimes[i]! - buzzTimes[i - 1]!
      if (interval < this.minBuzzInterval) {
        return {
          valid: false,
          error: 'Suspicious buzz pattern detected',
          code: 'SUSPICIOUS_PATTERN'
        }
      }
    }

    return { valid: true }
  }

  /**
   * Очищает устаревшие события
   */
  cleanupExpiredEvents(session: Session): Session {
    const now = Date.now()
    const maxEventAge = 60 * 60 * 1000 // 1 час

    return {
      ...session,
      buzzState: {
        ...session.buzzState,
        events: session.buzzState.events.filter(
          event => now - event.timestamp < maxEventAge
        )
      }
    }
  }

  /**
   * Получает статистику валидации
   */
  getValidationStats(session: Session): {
    totalEvents: number
    recentEvents: number
    suspiciousEvents: number
    activePlayers: number
  } {
    const now = Date.now()
    const recentThreshold = 5 * 60 * 1000 // 5 минут

    const totalEvents = session.buzzState.events.length
    const recentEvents = session.buzzState.events.filter(
      event => now - event.timestamp < recentThreshold
    ).length

    const suspiciousEvents = session.buzzState.events.filter(event => {
      // Простая эвристика для подозрительных событий
      const timeDiff = Math.abs(now - event.timestamp)
      return timeDiff > 10000 // События старше 10 секунд
    }).length

    const activePlayers = session.players.filter(player => {
      const playerAge = now - new Date(player.joinedAt).getTime()
      return player.isActive && playerAge < this.maxPlayerInactivity
    }).length

    return {
      totalEvents,
      recentEvents,
      suspiciousEvents,
      activePlayers
    }
  }
}

// Глобальный экземпляр
export const sessionValidator = new SessionValidator()
