import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Типы для сессий и игроков
export interface Player {
  id: string
  sessionId: string
  name: string
  teamId?: string
  joinedAt: string
  isActive: boolean
}

export interface Session {
  id: string
  gameId: string
  pin: string
  isActive: boolean
  createdAt: string
  players: Player[]
  maxPlayers?: number
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
