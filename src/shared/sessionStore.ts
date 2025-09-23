import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buzzRateLimiter } from './rateLimiter'
import { sessionValidator } from './sessionValidator'

// Типы для сессий и игроков
export interface Player {
  id: string
  sessionId: string
  name: string
  teamId?: string | null
  joinedAt: string
  isActive: boolean
}

// Buzz события
export interface BuzzEvent {
  id: string
  sessionId: string
  playerId: string
  timestamp: number
  isWinner: boolean
}

export interface BuzzState {
  isLocked: boolean
  winner: Player | null
  lockExpiresAt: number | null
  events: BuzzEvent[]
}

export interface Session {
  id: string
  gameId: string
  pin: string
  isActive: boolean
  createdAt: string
  players: Player[]
  maxPlayers?: number
  buzzState: BuzzState
}

export interface SessionStore {
  // Состояние
  currentSession: Session | null
  sessions: Session[]
  
  // Действия с сессиями
  createSession: (gameId: string, maxPlayers?: number) => Session
  stopSession: (sessionId: string) => void
  getSessionByPin: (pin: string) => Session | null
  getSessionById: (sessionId: string) => Session | null
  
  // Действия с игроками
  addPlayer: (sessionId: string, playerName: string) => Player
  removePlayer: (sessionId: string, playerId: string) => void
  updatePlayer: (sessionId: string, playerId: string, updates: Partial<Player>) => void
  assignPlayerToTeam: (sessionId: string, playerId: string, teamId: string) => void
  
  // Управление командами игроков
  removePlayerFromTeam: (sessionId: string, playerId: string) => void
  getPlayersByTeam: (sessionId: string, teamId: string) => Player[]
  getTeamAssignments: (sessionId: string) => { [teamId: string]: Player[] }
  getUnassignedPlayers: (sessionId: string) => Player[]
  getPlayerTeam: (sessionId: string, playerId: string) => string | null
  
  // Buzz функциональность
  buzzPlayer: (sessionId: string, playerId: string) => BuzzEvent | null
  lockBuzz: (sessionId: string, playerId: string, duration?: number) => void
  unlockBuzz: (sessionId: string) => void
  getBuzzWinner: (sessionId: string) => Player | null
  getBuzzState: (sessionId: string) => BuzzState | null
  resetBuzz: (sessionId: string) => void
  
  // Утилиты
  generatePin: () => string
  isSessionActive: (sessionId: string) => boolean
  getPlayersCount: (sessionId: string) => number
  clearAllSessions: () => void
}

// Генерация 6-значного PIN
const generatePin = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Создаем Zustand store
export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      currentSession: null,
      sessions: [],

      // Создание сессии
      createSession: (gameId: string, maxPlayers?: number) => {
        const pin = generatePin()
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const newSession: Session = {
          id: sessionId,
          gameId,
          pin,
          isActive: true,
          createdAt: new Date().toISOString(),
          players: [],
          buzzState: {
            isLocked: false,
            winner: null,
            lockExpiresAt: null,
            events: []
          },
          ...(maxPlayers !== undefined && { maxPlayers })
        }

        set((state) => ({
          currentSession: newSession,
          sessions: [...state.sessions, newSession]
        }))

        // Сохраняем в localStorage для быстрого доступа
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem(`jeopardy-session-${pin}`, JSON.stringify(newSession))
        }
        
        return newSession
      },

      // Остановка сессии
      stopSession: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId 
              ? { ...session, isActive: false }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId ? null : state.currentSession
        }))

        // Удаляем из localStorage
        const session = get().getSessionById(sessionId)
        if (session && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.removeItem(`jeopardy-session-${session.pin}`)
        }
      },

      // Получение сессии по PIN (только из памяти - безопасно)
      getSessionByPin: (pin: string) => {
        const state = get()
        return state.sessions.find(session => session.pin === pin && session.isActive) || null
      },

      // Получение сессии по ID
      getSessionById: (sessionId: string) => {
        const state = get()
        return state.sessions.find(session => session.id === sessionId) || null
      },

      // Добавление игрока
      addPlayer: (sessionId: string, playerName: string) => {
        const session = get().getSessionById(sessionId)
        if (!session || !session.isActive) {
          throw new Error('Session not found or inactive')
        }

        if (session.maxPlayers && session.players.length >= session.maxPlayers) {
          throw new Error('Session is full')
        }

        const playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newPlayer: Player = {
          id: playerId,
          sessionId,
          name: playerName,
          joinedAt: new Date().toISOString(),
          isActive: true
        }

        set((state) => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId 
              ? { ...session, players: [...session.players, newPlayer] }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId 
            ? { ...state.currentSession, players: [...state.currentSession.players, newPlayer] }
            : state.currentSession
        }))

        return newPlayer
      },

      // Удаление игрока
      removePlayer: (sessionId: string, playerId: string) => {
        set((state) => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId 
              ? { ...session, players: session.players.filter(p => p.id !== playerId) }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId 
            ? { ...state.currentSession, players: state.currentSession.players.filter(p => p.id !== playerId) }
            : state.currentSession
        }))
      },

      // Обновление игрока
      updatePlayer: (sessionId: string, playerId: string, updates: Partial<Player>) => {
        set((state) => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId 
              ? { 
                  ...session, 
                  players: session.players.map(p => 
                    p.id === playerId ? { ...p, ...updates } : p
                  )
                }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId 
            ? { 
                ...state.currentSession, 
                players: state.currentSession.players.map(p => 
                  p.id === playerId ? { ...p, ...updates } : p
                )
              }
            : state.currentSession
        }))
      },

      // Привязка игрока к команде
      assignPlayerToTeam: (sessionId: string, playerId: string, teamId: string) => {
        get().updatePlayer(sessionId, playerId, { teamId })
      },

      // Генерация PIN
      generatePin,

      // Проверка активности сессии
      isSessionActive: (sessionId: string) => {
        const session = get().getSessionById(sessionId)
        return session?.isActive || false
      },

      // Количество игроков в сессии
      getPlayersCount: (sessionId: string) => {
        const session = get().getSessionById(sessionId)
        return session?.players.length || 0
      },

      // Очистка всех сессий
      clearAllSessions: () => {
        set({ currentSession: null, sessions: [] })
        
        // Очищаем localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('jeopardy-session-')) {
            localStorage.removeItem(key)
          }
        })
      },

      // Buzz функциональность
      buzzPlayer: (sessionId: string, playerId: string) => {
        const session = get().getSessionById(sessionId)
        if (!session || !session.isActive) {
          return null
        }

        // Валидация сессии и игрока
        const sessionValidation = sessionValidator.validateSession(session)
        if (!sessionValidation.valid) {
          console.warn('Session validation failed:', sessionValidation.error)
          return null
        }

        const playerValidation = sessionValidator.validatePlayer(session, playerId)
        if (!playerValidation.valid) {
          console.warn('Player validation failed:', playerValidation.error)
          return null
        }

        // Rate limiting проверка
        const rateLimitResult = buzzRateLimiter.checkLimit(playerId)
        if (!rateLimitResult.allowed) {
          console.warn('Rate limit exceeded for player:', playerId)
          return null
        }

        // Проверка подозрительной активности
        const suspiciousActivity = sessionValidator.detectSuspiciousActivity(session, playerId)
        if (!suspiciousActivity.valid) {
          console.warn('Suspicious activity detected:', suspiciousActivity.error)
          return null
        }

        // Если buzz уже заблокирован, игнорируем
        if (session.buzzState.isLocked) {
          return null
        }

        const player = session.players.find(p => p.id === playerId)
        if (!player || !player.isActive) {
          return null
        }

        const buzzEvent: BuzzEvent = {
          id: `buzz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sessionId,
          playerId,
          timestamp: Date.now(),
          isWinner: true
        }

        // Валидация buzz события
        const buzzValidation = sessionValidator.validateBuzzEvent(session, playerId, buzzEvent)
        if (!buzzValidation.valid) {
          console.warn('Buzz event validation failed:', buzzValidation.error)
          return null
        }

        // Блокируем buzz на 3 секунды
        const lockExpiresAt = Date.now() + 3000

        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  buzzState: {
                    isLocked: true,
                    winner: player,
                    lockExpiresAt,
                    events: [...s.buzzState.events, buzzEvent]
                  }
                }
              : s
          ),
          currentSession: state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                buzzState: {
                  isLocked: true,
                  winner: player,
                  lockExpiresAt,
                  events: [...state.currentSession.buzzState.events, buzzEvent]
                }
              }
            : state.currentSession
        }))

        return buzzEvent
      },

      lockBuzz: (sessionId: string, playerId: string, duration: number = 3000) => {
        const session = get().getSessionById(sessionId)
        if (!session) return

        const player = session.players.find(p => p.id === playerId)
        if (!player) return

        const lockExpiresAt = Date.now() + duration

        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  buzzState: {
                    ...s.buzzState,
                    isLocked: true,
                    winner: player,
                    lockExpiresAt
                  }
                }
              : s
          ),
          currentSession: state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                buzzState: {
                  ...state.currentSession.buzzState,
                  isLocked: true,
                  winner: player,
                  lockExpiresAt
                }
              }
            : state.currentSession
        }))
      },

      unlockBuzz: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  buzzState: {
                    ...s.buzzState,
                    isLocked: false,
                    lockExpiresAt: null
                  }
                }
              : s
          ),
          currentSession: state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                buzzState: {
                  ...state.currentSession.buzzState,
                  isLocked: false,
                  lockExpiresAt: null
                }
              }
            : state.currentSession
        }))
      },

      getBuzzWinner: (sessionId: string) => {
        const session = get().getSessionById(sessionId)
        return session?.buzzState.winner || null
      },

      getBuzzState: (sessionId: string) => {
        const session = get().getSessionById(sessionId)
        return session?.buzzState || null
      },

      resetBuzz: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  buzzState: {
                    isLocked: false,
                    winner: null,
                    lockExpiresAt: null,
                    events: []
                  }
                }
              : s
          ),
          currentSession: state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                buzzState: {
                  isLocked: false,
                  winner: null,
                  lockExpiresAt: null,
                  events: []
                }
              }
            : state.currentSession
        }))
      },

      // Управление командами игроков
      removePlayerFromTeam: (sessionId: string, playerId: string) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  players: s.players.map(p =>
                    p.id === playerId ? { ...p, teamId: null } : p
                  )
                }
              : s
          ),
          currentSession: state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                players: state.currentSession.players.map(p =>
                  p.id === playerId ? { ...p, teamId: null } : p
                )
              }
            : state.currentSession
        }))
      },

      getPlayersByTeam: (sessionId: string, teamId: string) => {
        const session = get().getSessionById(sessionId)
        return session?.players.filter(p => p.teamId === teamId) || []
      },

      getTeamAssignments: (sessionId: string) => {
        const session = get().getSessionById(sessionId)
        if (!session) return {}

        const assignments: { [teamId: string]: Player[] } = {}
        session.players.forEach(player => {
          if (player.teamId) {
            if (!assignments[player.teamId]) {
              assignments[player.teamId] = []
            }
            assignments[player.teamId]!.push(player)
          }
        })
        return assignments
      },

      getUnassignedPlayers: (sessionId: string) => {
        const session = get().getSessionById(sessionId)
        return session?.players.filter(p => !p.teamId || p.teamId === null) || []
      },

      getPlayerTeam: (sessionId: string, playerId: string) => {
        const session = get().getSessionById(sessionId)
        const player = session?.players.find(p => p.id === playerId)
        return player?.teamId || null
      }
    }),
    {
      name: 'jeopardy-session-store',
      partialize: (state) => ({
        currentSession: state.currentSession,
        sessions: state.sessions,
      }),
    }
  )
)

// Утилиты для работы с сессиями
export const sessionUtils = {
  // Валидация PIN
  isValidPin: (pin: string): boolean => {
    return /^\d{6}$/.test(pin)
  },

  // Валидация имени игрока
  isValidPlayerName: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 20
  },

  // Генерация уникального имени игрока
  generatePlayerName: (baseName: string, existingNames: string[]): string => {
    let name = baseName.trim()
    let counter = 1
    
    while (existingNames.includes(name)) {
      name = `${baseName.trim()} ${counter}`
      counter++
    }
    
    return name
  },

  // Получение URL для подключения по PIN
  getPlayerUrl: (pin: string): string => {
    return `/p/${pin}`
  },

  // Получение URL для игрока
  getPlayerSessionUrl: (sessionId: string): string => {
    return `/player/${sessionId}`
  }
}
