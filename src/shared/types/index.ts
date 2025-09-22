// Game types
export interface Game {
  id: string
  orgId: string
  title: string
  status: 'draft' | 'active' | 'finished'
  createdBy: string
  createdAt: string
}

export interface Team {
  id: string
  gameId: string
  name: string
  order: number
}

export interface Category {
  id: string
  gameId: string
  name: string
  order: number
}

export interface Question {
  id: string
  categoryId: string
  value: number
  text: string
  answer: string
  order: number
  isLocked: boolean
  isDone: boolean
}

export interface ScoreEvent {
  id: string
  gameId: string
  teamId: string
  questionId: string
  delta: number
  createdAt: string
}

// Realtime events
export interface GameEvent {
  type: 'BOARD_SELECT' | 'ANSWER_TOGGLE' | 'JUDGE' | 'LOCK' | 'BUZZ' | 'ANSWER_SUBMIT'
  questionId?: string
  teamId?: string
  playerId?: string
  show?: boolean
  correct?: boolean
  delta?: number
  ts?: number
  payload?: Record<string, unknown>
}

// User and organization types
export interface User {
  id: string
  email: string
  name?: string
}

export interface Organization {
  id: string
  name: string
  createdBy: string
  createdAt: string
}

export interface Membership {
  userId: string
  orgId: string
  role: 'Owner' | 'Admin' | 'Host' | 'Viewer'
  createdAt: string
}

// Plan types
export interface Plan {
  id: string
  name: string
  caps: {
    maxGames: number
    maxTeams: number
    maxGridRows: number
    maxGridCols: number
    branding: boolean
  }
}

export interface OrgPlan {
  orgId: string
  planId: string
  active: boolean
  since: string
}
