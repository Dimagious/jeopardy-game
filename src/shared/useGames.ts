import { useState, useEffect, useCallback } from 'react'
import { GamesApi } from './gamesApi'
import { 
  Game, 
  CreateGameRequest, 
  UpdateGameRequest, 
  GameListFilters
} from './types'

export function useGames(orgId: string | null) {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Загрузить игры
  const loadGames = useCallback(async (filters: GameListFilters = {}) => {
    if (!orgId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await GamesApi.getGames(orgId, filters)
      setGames(response.games)
      setTotal(response.total)
      setHasMore(response.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games')
    } finally {
      setIsLoading(false)
    }
  }, [orgId])

  // Создать игру
  const createGame = useCallback(async (
    userId: string,
    gameData: CreateGameRequest
  ): Promise<Game> => {
    if (!orgId) throw new Error('Organization ID is required')

    try {
      const newGame = await GamesApi.createGame(orgId, userId, gameData)
      setGames(prev => [newGame, ...prev])
      setTotal(prev => prev + 1)
      return newGame
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game')
      throw err
    }
  }, [orgId])

  // Обновить игру
  const updateGame = useCallback(async (
    gameId: string,
    updates: UpdateGameRequest
  ): Promise<Game> => {
    try {
      const updatedGame = await GamesApi.updateGame(gameId, updates)
      setGames(prev => prev.map(game => 
        game.id === gameId ? updatedGame : game
      ))
      return updatedGame
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game')
      throw err
    }
  }, [])

  // Удалить игру
  const deleteGame = useCallback(async (gameId: string): Promise<void> => {
    try {
      await GamesApi.deleteGame(gameId)
      setGames(prev => prev.filter(game => game.id !== gameId))
      setTotal(prev => prev - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete game')
      throw err
    }
  }, [])

  // Дублировать игру
  const duplicateGame = useCallback(async (
    gameId: string,
    newTitle: string
  ): Promise<Game> => {
    try {
      const duplicatedGame = await GamesApi.duplicateGame(gameId, newTitle)
      setGames(prev => [duplicatedGame, ...prev])
      setTotal(prev => prev + 1)
      return duplicatedGame
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate game')
      throw err
    }
  }, [])

  // Загрузить игры при изменении orgId
  useEffect(() => {
    if (orgId) {
      loadGames()
    } else {
      setGames([])
      setTotal(0)
      setHasMore(false)
    }
  }, [orgId, loadGames])

  return {
    games,
    isLoading,
    error,
    total,
    hasMore,
    loadGames,
    createGame,
    updateGame,
    deleteGame,
    duplicateGame
  }
}

// Хук для работы с одной игрой
export function useGame(gameId: string | null) {
  const [game, setGame] = useState<Game | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Загрузить игру
  const loadGame = useCallback(async () => {
    if (!gameId) return

    setIsLoading(true)
    setError(null)

    try {
      const gameData = await GamesApi.getGame(gameId)
      setGame(gameData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game')
    } finally {
      setIsLoading(false)
    }
  }, [gameId])

  // Обновить игру
  const updateGame = useCallback(async (updates: UpdateGameRequest): Promise<Game> => {
    if (!gameId) throw new Error('Game ID is required')

    try {
      const updatedGame = await GamesApi.updateGame(gameId, updates)
      setGame(updatedGame)
      return updatedGame
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game')
      throw err
    }
  }, [gameId])

  // Загрузить игру при изменении gameId
  useEffect(() => {
    if (gameId) {
      loadGame()
    } else {
      setGame(null)
    }
  }, [gameId, loadGame])

  return {
    game,
    isLoading,
    error,
    loadGame,
    updateGame
  }
}

// Хук для проверки лимитов плана
export function usePlanLimits(orgId: string | null) {
  const [limits, setLimits] = useState<{
    currentGames: number
    maxGames: number
    canCreate: boolean
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Проверить лимиты
  const checkLimits = useCallback(async () => {
    if (!orgId) return

    setIsLoading(true)
    setError(null)

    try {
      const limitsData = await GamesApi.checkPlanLimits(orgId)
      setLimits(limitsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check limits')
    } finally {
      setIsLoading(false)
    }
  }, [orgId])

  // Проверить лимиты при изменении orgId
  useEffect(() => {
    if (orgId) {
      checkLimits()
    } else {
      setLimits(null)
    }
  }, [orgId, checkLimits])

  return {
    limits,
    isLoading,
    error,
    checkLimits
  }
}
