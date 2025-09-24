// Game types
export interface Game {
  id: string
  orgId: string
  title: string
  description?: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  settings: {
    gridRows: number
    gridCols: number
    maxTeams: number
    gameMode: 'jeopardy' | 'buzzer'
    [key: string]: unknown
  }
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Game creation/update types
export interface CreateGameRequest {
  title: string
  description?: string
  settings: {
    gridRows: number
    gridCols: number
    maxTeams: number
    gameMode: 'jeopardy' | 'buzzer'
  }
}

export interface UpdateGameRequest {
  title?: string
  description?: string
  status?: 'draft' | 'active' | 'completed' | 'archived'
  settings?: Partial<Game['settings']>
}

// Game list and filtering
export interface GameListFilters {
  status?: Game['status'][] | undefined
  search?: string | undefined
  sortBy?: 'title' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface GameListResponse {
  games: Game[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Локальное состояние игры
export interface GameState {
  gameId: string
  currentQuestion: {
    id: string
    categoryId: string
    value: number
    text: string
    answer: string
    showAnswer: boolean
  } | null
  selectedTeam: string | null
  isQuestionOpen: boolean
  lastUpdated: number
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
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Organization {
  id: string
  name: string
  description?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Membership {
  userId: string
  orgId: string
  role: 'Owner' | 'Admin' | 'Host' | 'Viewer'
  createdAt: string
  updatedAt: string
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  organizations: Organization[]
  currentOrg?: Organization
  currentRole?: 'Owner' | 'Admin' | 'Host' | 'Viewer'
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  currentOrg: Organization | null
  currentRole: 'Owner' | 'Admin' | 'Host' | 'Viewer' | null
}

// Role permissions
export interface RolePermissions {
  canManageUsers: boolean
  canManageGames: boolean
  canManagePacks: boolean
  canManageBilling: boolean
  canViewAnalytics: boolean
  canHostGames: boolean
  canViewScreen: boolean
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
