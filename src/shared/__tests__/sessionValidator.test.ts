import { describe, it, expect, beforeEach } from 'vitest'
import { SessionValidator } from '../sessionValidator'
import { Session, Player, BuzzEvent } from '../sessionStore'

describe('SessionValidator', () => {
  let validator: SessionValidator
  let mockSession: Session
  let mockPlayer: Player

  beforeEach(() => {
    validator = new SessionValidator()
    
    mockPlayer = {
      id: 'player1',
      sessionId: 'session1',
      name: 'Test Player',
      joinedAt: new Date().toISOString(),
      isActive: true
    }

    mockSession = {
      id: 'session1',
      gameId: 'game1',
      pin: '123456',
      isActive: true,
      createdAt: new Date().toISOString(),
      players: [mockPlayer],
      buzzState: {
        isLocked: false,
        winner: null,
        lockExpiresAt: null,
        events: []
      }
    }
  })

  describe('validateSession', () => {
    it('should validate active session', () => {
      const result = validator.validateSession(mockSession)
      expect(result.valid).toBe(true)
    })

    it('should reject null session', () => {
      const result = validator.validateSession(null)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Session not found')
      expect(result.code).toBe('SESSION_NOT_FOUND')
    })

    it('should reject inactive session', () => {
      const inactiveSession = { ...mockSession, isActive: false }
      const result = validator.validateSession(inactiveSession)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Session is not active')
      expect(result.code).toBe('SESSION_INACTIVE')
    })

    it('should reject expired session', () => {
      const expiredSession = {
        ...mockSession,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() // 25 hours ago
      }
      const result = validator.validateSession(expiredSession)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Session expired')
      expect(result.code).toBe('SESSION_EXPIRED')
    })
  })

  describe('validatePlayer', () => {
    it('should validate active player', () => {
      const result = validator.validatePlayer(mockSession, 'player1')
      expect(result.valid).toBe(true)
    })

    it('should reject player not in session', () => {
      const result = validator.validatePlayer(mockSession, 'player2')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Player not found in session')
      expect(result.code).toBe('PLAYER_NOT_FOUND')
    })

    it('should reject inactive player', () => {
      const inactivePlayer = { ...mockPlayer, isActive: false }
      const sessionWithInactivePlayer = {
        ...mockSession,
        players: [inactivePlayer]
      }
      const result = validator.validatePlayer(sessionWithInactivePlayer, 'player1')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Player is not active')
      expect(result.code).toBe('PLAYER_INACTIVE')
    })

    it('should reject player inactive too long', () => {
      const oldPlayer = {
        ...mockPlayer,
        joinedAt: new Date(Date.now() - 31 * 60 * 1000).toISOString() // 31 minutes ago
      }
      const sessionWithOldPlayer = {
        ...mockSession,
        players: [oldPlayer]
      }
      const result = validator.validatePlayer(sessionWithOldPlayer, 'player1')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Player inactive too long')
      expect(result.code).toBe('PLAYER_INACTIVE_TOO_LONG')
    })
  })

  describe('validateBuzzEvent', () => {
    let mockBuzzEvent: BuzzEvent

    beforeEach(() => {
      mockBuzzEvent = {
        id: 'buzz1',
        sessionId: 'session1',
        playerId: 'player1',
        timestamp: Date.now(),
        isWinner: true
      }
    })

    it('should validate valid buzz event', () => {
      const result = validator.validateBuzzEvent(mockSession, 'player1', mockBuzzEvent)
      expect(result.valid).toBe(true)
    })

    it('should reject buzz event with invalid timestamp', () => {
      const oldBuzzEvent = {
        ...mockBuzzEvent,
        timestamp: Date.now() - 10000 // 10 seconds ago
      }
      const result = validator.validateBuzzEvent(mockSession, 'player1', oldBuzzEvent)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Buzz event timestamp is invalid')
      expect(result.code).toBe('INVALID_TIMESTAMP')
    })

    it('should reject buzz event when buzz is locked', () => {
      const lockedSession = {
        ...mockSession,
        buzzState: {
          ...mockSession.buzzState,
          isLocked: true
        }
      }
      const result = validator.validateBuzzEvent(lockedSession, 'player1', mockBuzzEvent)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Buzz is currently locked')
      expect(result.code).toBe('BUZZ_LOCKED')
    })
  })

  describe('validateActionContext', () => {
    it('should validate valid action context', () => {
      const context = {
        sessionId: 'session1',
        playerId: 'player1',
        timestamp: Date.now(),
        action: 'buzz'
      }
      const result = validator.validateActionContext(context)
      expect(result.valid).toBe(true)
    })

    it('should reject context with missing fields', () => {
      const context = {
        sessionId: '',
        playerId: 'player1',
        timestamp: Date.now(),
        action: 'buzz'
      }
      const result = validator.validateActionContext(context)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Missing required fields')
      expect(result.code).toBe('MISSING_FIELDS')
    })

    it('should reject context with old timestamp', () => {
      const context = {
        sessionId: 'session1',
        playerId: 'player1',
        timestamp: Date.now() - 15000, // 15 seconds ago
        action: 'buzz'
      }
      const result = validator.validateActionContext(context)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Action timestamp is too old')
      expect(result.code).toBe('TIMESTAMP_TOO_OLD')
    })

    it('should reject context with invalid action', () => {
      const context = {
        sessionId: 'session1',
        playerId: 'player1',
        timestamp: Date.now(),
        action: 'invalid_action'
      }
      const result = validator.validateActionContext(context)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid action')
      expect(result.code).toBe('INVALID_ACTION')
    })
  })

  describe('detectSuspiciousActivity', () => {
    it('should not detect suspicious activity for normal player', () => {
      const result = validator.detectSuspiciousActivity(mockSession, 'player1')
      expect(result.valid).toBe(true)
    })

    it('should detect suspicious activity for player with too many events', () => {
      const sessionWithManyEvents = {
        ...mockSession,
        buzzState: {
          ...mockSession.buzzState,
          events: Array.from({ length: 15 }, (_, i) => ({
            id: `buzz${i}`,
            sessionId: 'session1',
            playerId: 'player1',
            timestamp: Date.now() - i * 1000,
            isWinner: false
          }))
        }
      }
      const result = validator.detectSuspiciousActivity(sessionWithManyEvents, 'player1')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Too many buzz events detected')
      expect(result.code).toBe('SUSPICIOUS_ACTIVITY')
    })
  })

  describe('cleanupExpiredEvents', () => {
    it('should remove expired events', () => {
      const sessionWithOldEvents = {
        ...mockSession,
        buzzState: {
          ...mockSession.buzzState,
          events: [
            {
              id: 'buzz1',
              sessionId: 'session1',
              playerId: 'player1',
              timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
              isWinner: false
            },
            {
              id: 'buzz2',
              sessionId: 'session1',
              playerId: 'player1',
              timestamp: Date.now() - 30 * 60 * 1000, // 30 minutes ago
              isWinner: false
            }
          ]
        }
      }
      
      const cleanedSession = validator.cleanupExpiredEvents(sessionWithOldEvents)
      expect(cleanedSession.buzzState.events).toHaveLength(1)
      expect(cleanedSession.buzzState.events[0]!.id).toBe('buzz2')
    })
  })

  describe('getValidationStats', () => {
    it('should return correct validation stats', () => {
      const sessionWithEvents = {
        ...mockSession,
        buzzState: {
          ...mockSession.buzzState,
          events: [
            {
              id: 'buzz1',
              sessionId: 'session1',
              playerId: 'player1',
              timestamp: Date.now() - 1000,
              isWinner: false
            },
            {
              id: 'buzz2',
              sessionId: 'session1',
              playerId: 'player1',
              timestamp: Date.now() - 2000,
              isWinner: false
            }
          ]
        }
      }
      
      const stats = validator.getValidationStats(sessionWithEvents)
      expect(stats.totalEvents).toBe(2)
      expect(stats.recentEvents).toBe(2)
      expect(stats.activePlayers).toBe(1)
    })
  })
})
