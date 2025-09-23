import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSessionStore, sessionUtils } from '../sessionStore'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock window and localStorage for Node.js environment
Object.defineProperty(global, 'window', {
  value: {
    localStorage: localStorageMock,
  },
  writable: true,
})

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('sessionStore', () => {
  beforeEach(() => {
    // Reset store state
    useSessionStore.getState().clearAllSessions()
    vi.clearAllMocks()
  })

  describe('createSession', () => {
    it('should create a new session with valid PIN', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId, 10)

      expect(session).toBeDefined()
      expect(session.gameId).toBe(gameId)
      expect(session.isActive).toBe(true)
      expect(session.maxPlayers).toBe(10)
      expect(session.players).toEqual([])
      expect(session.pin).toMatch(/^\d{6}$/)
      expect(session.id).toMatch(/^session-\d+-[a-z0-9]+$/)
    })

    it('should create session without maxPlayers limit', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)

      expect(session.maxPlayers).toBeUndefined()
    })

    it('should set currentSession when creating', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)

      expect(useSessionStore.getState().currentSession).toBe(session)
    })

    it('should save session to localStorage', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `jeopardy-session-${session.pin}`,
        JSON.stringify(session)
      )
    })
  })

  describe('stopSession', () => {
    it('should stop active session', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)
      
      useSessionStore.getState().stopSession(session.id)

      const updatedSession = useSessionStore.getState().getSessionById(session.id)
      expect(updatedSession?.isActive).toBe(false)
      expect(useSessionStore.getState().currentSession).toBeNull()
    })

    it('should remove session from localStorage when stopped', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)
      
      useSessionStore.getState().stopSession(session.id)

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        `jeopardy-session-${session.pin}`
      )
    })
  })

  describe('getSessionByPin', () => {
    it('should find session by PIN', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)
      
      const foundSession = useSessionStore.getState().getSessionByPin(session.pin)
      expect(foundSession).toBe(session)
    })

    it('should return null for non-existent PIN', () => {
      const foundSession = useSessionStore.getState().getSessionByPin('999999')
      expect(foundSession).toBeNull()
    })

    it('should return null for inactive session', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)
      useSessionStore.getState().stopSession(session.id)
      
      const foundSession = useSessionStore.getState().getSessionByPin(session.pin)
      expect(foundSession).toBeNull()
    })
  })

  describe('addPlayer', () => {
    it('should add player to session', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)
      const playerName = 'Test Player'

      const player = useSessionStore.getState().addPlayer(session.id, playerName)

      expect(player).toBeDefined()
      expect(player.name).toBe(playerName)
      expect(player.sessionId).toBe(session.id)
      expect(player.isActive).toBe(true)
      expect(player.id).toMatch(/^player-\d+-[a-z0-9]+$/)

      const updatedSession = useSessionStore.getState().getSessionById(session.id)
      expect(updatedSession?.players).toHaveLength(1)
      expect(updatedSession?.players[0]).toEqual(player)
    })

    it('should throw error for non-existent session', () => {
      expect(() => {
        useSessionStore.getState().addPlayer('non-existent', 'Test Player')
      }).toThrow('Session not found or inactive')
    })

    it('should throw error when session is full', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId, 1)
      
      // Add first player
      useSessionStore.getState().addPlayer(session.id, 'Player 1')

      // Try to add second player
      expect(() => {
        useSessionStore.getState().addPlayer(session.id, 'Player 2')
      }).toThrow('Session is full')
    })
  })

  describe('removePlayer', () => {
    it('should remove player from session', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)
      const player = useSessionStore.getState().addPlayer(session.id, 'Test Player')

      useSessionStore.getState().removePlayer(session.id, player.id)

      const updatedSession = useSessionStore.getState().getSessionById(session.id)
      expect(updatedSession?.players).toHaveLength(0)
    })
  })

  describe('updatePlayer', () => {
    it('should update player information', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)
      const player = useSessionStore.getState().addPlayer(session.id, 'Test Player')

      useSessionStore.getState().updatePlayer(session.id, player.id, { 
        name: 'Updated Player',
        teamId: 'team-123'
      })

      const updatedSession = useSessionStore.getState().getSessionById(session.id)
      const updatedPlayer = updatedSession?.players[0]
      expect(updatedPlayer?.name).toBe('Updated Player')
      expect(updatedPlayer?.teamId).toBe('team-123')
    })
  })

  describe('assignPlayerToTeam', () => {
    it('should assign player to team', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)
      const player = useSessionStore.getState().addPlayer(session.id, 'Test Player')

      useSessionStore.getState().assignPlayerToTeam(session.id, player.id, 'team-123')

      const updatedSession = useSessionStore.getState().getSessionById(session.id)
      const updatedPlayer = updatedSession?.players[0]
      expect(updatedPlayer?.teamId).toBe('team-123')
    })
  })

  describe('isSessionActive', () => {
    it('should return true for active session', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)

      expect(useSessionStore.getState().isSessionActive(session.id)).toBe(true)
    })

    it('should return false for inactive session', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)
      useSessionStore.getState().stopSession(session.id)

      expect(useSessionStore.getState().isSessionActive(session.id)).toBe(false)
    })

    it('should return false for non-existent session', () => {
      expect(useSessionStore.getState().isSessionActive('non-existent')).toBe(false)
    })
  })

  describe('getPlayersCount', () => {
    it('should return correct player count', () => {
      const gameId = 'test-game-123'
      const session = useSessionStore.getState().createSession(gameId)

      expect(useSessionStore.getState().getPlayersCount(session.id)).toBe(0)

      useSessionStore.getState().addPlayer(session.id, 'Player 1')
      expect(useSessionStore.getState().getPlayersCount(session.id)).toBe(1)

      useSessionStore.getState().addPlayer(session.id, 'Player 2')
      expect(useSessionStore.getState().getPlayersCount(session.id)).toBe(2)
    })
  })

  describe('clearAllSessions', () => {
    it('should clear all sessions and current session', () => {
      const gameId = 'test-game-123'
      useSessionStore.getState().createSession(gameId)
      useSessionStore.getState().createSession(gameId)

      expect(useSessionStore.getState().sessions).toHaveLength(2)
      expect(useSessionStore.getState().currentSession).toBeDefined()

      useSessionStore.getState().clearAllSessions()

      expect(useSessionStore.getState().sessions).toHaveLength(0)
      expect(useSessionStore.getState().currentSession).toBeNull()
    })
  })
})

describe('sessionUtils', () => {
  describe('isValidPin', () => {
    it('should validate 6-digit PIN', () => {
      expect(sessionUtils.isValidPin('123456')).toBe(true)
      expect(sessionUtils.isValidPin('000000')).toBe(true)
      expect(sessionUtils.isValidPin('999999')).toBe(true)
    })

    it('should reject invalid PINs', () => {
      expect(sessionUtils.isValidPin('12345')).toBe(false)
      expect(sessionUtils.isValidPin('1234567')).toBe(false)
      expect(sessionUtils.isValidPin('abc123')).toBe(false)
      expect(sessionUtils.isValidPin('')).toBe(false)
    })
  })

  describe('isValidPlayerName', () => {
    it('should validate player names', () => {
      expect(sessionUtils.isValidPlayerName('John')).toBe(true)
      expect(sessionUtils.isValidPlayerName('  John  ')).toBe(true)
      expect(sessionUtils.isValidPlayerName('A')).toBe(false)
      expect(sessionUtils.isValidPlayerName('A'.repeat(21))).toBe(false)
      expect(sessionUtils.isValidPlayerName('')).toBe(false)
    })
  })

  describe('generatePlayerName', () => {
    it('should generate unique names', () => {
      const baseName = 'Player'
      const existingNames = ['Player', 'Player 1', 'Player 2']

      const uniqueName = sessionUtils.generatePlayerName(baseName, existingNames)
      expect(uniqueName).toBe('Player 3')
    })

    it('should return original name if not taken', () => {
      const baseName = 'UniquePlayer'
      const existingNames = ['Player', 'Player 1']

      const uniqueName = sessionUtils.generatePlayerName(baseName, existingNames)
      expect(uniqueName).toBe('UniquePlayer')
    })
  })

  describe('getPlayerUrl', () => {
    it('should generate correct PIN URL', () => {
      expect(sessionUtils.getPlayerUrl('123456')).toBe('/p/123456')
    })
  })

  describe('getPlayerSessionUrl', () => {
    it('should generate correct session URL', () => {
      expect(sessionUtils.getPlayerSessionUrl('session-123')).toBe('/player/session-123')
    })
  })
})
