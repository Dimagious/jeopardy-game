import { useState, useEffect, useCallback } from 'react'
import { TeamsApi } from './teamsApi'
import { Team, CreateTeamRequest, UpdateTeamRequest, ReorderTeamsRequest, TeamLimits } from './types'

export function useTeams(gameId: string | null) {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [limits, setLimits] = useState<TeamLimits | null>(null)

  const loadTeams = useCallback(async () => {
    if (!gameId) return

    setIsLoading(true)
    setError(null)

    try {
      const [teamsData, limitsData] = await Promise.all([
        TeamsApi.getTeams(gameId),
        TeamsApi.checkTeamLimits(gameId)
      ])

      setTeams(teamsData)
      setLimits(limitsData)
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to load teams')
      setError(error)
      console.error('Failed to load teams:', error)
    } finally {
      setIsLoading(false)
    }
  }, [gameId])

  const createTeam = useCallback(async (teamData: CreateTeamRequest): Promise<Team> => {
    if (!gameId) throw new Error('Game ID is required')

    try {
      const newTeam = await TeamsApi.createTeam(gameId, teamData)
      await loadTeams() // Перезагружаем список
      return newTeam
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to create team')
      setError(error)
      throw error
    }
  }, [gameId, loadTeams])

  const updateTeam = useCallback(async (teamId: string, teamData: UpdateTeamRequest): Promise<Team> => {
    try {
      const updatedTeam = await TeamsApi.updateTeam(teamId, teamData)
      await loadTeams() // Перезагружаем список
      return updatedTeam
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to update team')
      setError(error)
      throw error
    }
  }, [loadTeams])

  const deleteTeam = useCallback(async (teamId: string): Promise<void> => {
    try {
      await TeamsApi.deleteTeam(teamId)
      await loadTeams() // Перезагружаем список
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to delete team')
      setError(error)
      throw error
    }
  }, [loadTeams])

  const reorderTeams = useCallback(async (reorderData: ReorderTeamsRequest): Promise<Team[]> => {
    if (!gameId) throw new Error('Game ID is required')

    try {
      const reorderedTeams = await TeamsApi.reorderTeams(gameId, reorderData)
      setTeams(reorderedTeams)
      return reorderedTeams
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to reorder teams')
      setError(error)
      throw error
    }
  }, [gameId])

  const duplicateTeam = useCallback(async (teamId: string, newName?: string): Promise<Team> => {
    try {
      const duplicatedTeam = await TeamsApi.duplicateTeam(teamId, newName)
      await loadTeams() // Перезагружаем список
      return duplicatedTeam
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to duplicate team')
      setError(error)
      throw error
    }
  }, [loadTeams])

  const checkLimits = useCallback(async (): Promise<TeamLimits> => {
    if (!gameId) throw new Error('Game ID is required')

    try {
      const limitsData = await TeamsApi.checkTeamLimits(gameId)
      setLimits(limitsData)
      return limitsData
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to check limits')
      setError(error)
      throw error
    }
  }, [gameId])

  // Загружаем команды при изменении gameId
  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  return {
    teams,
    isLoading,
    error,
    limits,
    createTeam,
    updateTeam,
    deleteTeam,
    reorderTeams,
    duplicateTeam,
    checkLimits,
    loadTeams
  }
}

export function useTeam(teamId: string | null) {
  const [team, setTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadTeam = useCallback(async () => {
    if (!teamId) return

    setIsLoading(true)
    setError(null)

    try {
      const teamData = await TeamsApi.getTeam(teamId)
      setTeam(teamData)
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to load team')
      setError(error)
      console.error('Failed to load team:', error)
    } finally {
      setIsLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    loadTeam()
  }, [loadTeam])

  return {
    team,
    isLoading,
    error,
    loadTeam
  }
}
