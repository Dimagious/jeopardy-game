import { useState, useEffect, useCallback } from 'react'
import { PacksApi } from './packsApi'
import { 
  QuestionPack, 
  CreatePackRequest, 
  UpdatePackRequest, 
  PackPreview, 
  PackImportRequest, 
  PackFilters 
} from './types'

export function usePacks(orgId: string | null, filters: PackFilters = {}) {
  const [packs, setPacks] = useState<QuestionPack[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadPacks = useCallback(async () => {
    if (!orgId) return

    setIsLoading(true)
    setError(null)

    try {
      const packsData = await PacksApi.getPacks(orgId, filters)
      setPacks(packsData)
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to load packs')
      setError(error)
      console.error('Failed to load packs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [orgId, filters])

  const createPack = useCallback(async (packData: CreatePackRequest): Promise<QuestionPack> => {
    if (!orgId) throw new Error('Organization ID is required')

    try {
      const newPack = await PacksApi.createPack(orgId, packData)
      await loadPacks() // Перезагружаем список
      return newPack
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to create pack')
      setError(error)
      throw error
    }
  }, [orgId, loadPacks])

  const updatePack = useCallback(async (packId: string, packData: UpdatePackRequest): Promise<QuestionPack> => {
    try {
      const updatedPack = await PacksApi.updatePack(packId, packData)
      await loadPacks() // Перезагружаем список
      return updatedPack
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to update pack')
      setError(error)
      throw error
    }
  }, [loadPacks])

  const deletePack = useCallback(async (packId: string): Promise<void> => {
    try {
      await PacksApi.deletePack(packId)
      await loadPacks() // Перезагружаем список
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to delete pack')
      setError(error)
      throw error
    }
  }, [loadPacks])

  const duplicatePack = useCallback(async (packId: string, newTitle?: string): Promise<QuestionPack> => {
    try {
      const duplicatedPack = await PacksApi.duplicatePack(packId, newTitle)
      await loadPacks() // Перезагружаем список
      return duplicatedPack
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to duplicate pack')
      setError(error)
      throw error
    }
  }, [loadPacks])

  const importPackToGame = useCallback(async (importData: PackImportRequest): Promise<void> => {
    try {
      await PacksApi.importPackToGame(importData)
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to import pack to game')
      setError(error)
      throw error
    }
  }, [])

  const exportGameAsPack = useCallback(async (gameId: string, packData: CreatePackRequest): Promise<QuestionPack> => {
    try {
      const newPack = await PacksApi.exportGameAsPack(gameId, packData)
      await loadPacks() // Перезагружаем список
      return newPack
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to export game as pack')
      setError(error)
      throw error
    }
  }, [loadPacks])

  // Загружаем пакеты при изменении orgId или фильтров
  useEffect(() => {
    loadPacks()
  }, [loadPacks])

  return {
    packs,
    isLoading,
    error,
    createPack,
    updatePack,
    deletePack,
    duplicatePack,
    importPackToGame,
    exportGameAsPack,
    loadPacks
  }
}

export function usePack(packId: string | null) {
  const [pack, setPack] = useState<QuestionPack | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadPack = useCallback(async () => {
    if (!packId) return

    setIsLoading(true)
    setError(null)

    try {
      const packData = await PacksApi.getPack(packId)
      setPack(packData)
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to load pack')
      setError(error)
      console.error('Failed to load pack:', error)
    } finally {
      setIsLoading(false)
    }
  }, [packId])

  useEffect(() => {
    loadPack()
  }, [loadPack])

  return {
    pack,
    isLoading,
    error,
    loadPack
  }
}

export function usePackPreview(packId: string | null) {
  const [preview, setPreview] = useState<PackPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadPreview = useCallback(async () => {
    if (!packId) return

    setIsLoading(true)
    setError(null)

    try {
      const previewData = await PacksApi.getPackPreview(packId)
      setPreview(previewData)
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to load pack preview')
      setError(error)
      console.error('Failed to load pack preview:', error)
    } finally {
      setIsLoading(false)
    }
  }, [packId])

  useEffect(() => {
    loadPreview()
  }, [loadPreview])

  return {
    preview,
    isLoading,
    error,
    loadPreview
  }
}

export function usePackTags(orgId: string | null) {
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadTags = useCallback(async () => {
    if (!orgId) return

    setIsLoading(true)
    setError(null)

    try {
      const tagsData = await PacksApi.getAvailableTags(orgId)
      setTags(tagsData)
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to load tags')
      setError(error)
      console.error('Failed to load tags:', error)
    } finally {
      setIsLoading(false)
    }
  }, [orgId])

  useEffect(() => {
    loadTags()
  }, [loadTags])

  return {
    tags,
    isLoading,
    error,
    loadTags
  }
}
