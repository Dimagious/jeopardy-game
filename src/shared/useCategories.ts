import { useState, useEffect, useCallback } from 'react'
import { categoriesApi } from './categoriesApi'
import { Category, CreateCategoryRequest, UpdateCategoryRequest, ReorderCategoriesRequest } from './types'

export function useCategories(gameId: string | null) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limits, setLimits] = useState<{ current: number; max: number; canCreate: boolean } | null>(null)

  const loadCategories = useCallback(async () => {
    if (!gameId) {
      setCategories([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [categoriesData, limitsData] = await Promise.all([
        categoriesApi.getCategories(gameId),
        categoriesApi.checkCategoryLimits(gameId)
      ])

      setCategories(categoriesData)
      setLimits(limitsData)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories'
      setError(errorMessage)
      console.error('Error loading categories:', err)
    } finally {
      setIsLoading(false)
    }
  }, [gameId])

  const createCategory = useCallback(async (categoryData: CreateCategoryRequest) => {
    if (!gameId) {
      setError('Game ID is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const newCategory = await categoriesApi.createCategory(gameId, categoryData)
      setCategories(prev => [...prev, newCategory])
      setLimits(prev => prev ? { ...prev, current: prev.current + 1, canCreate: prev.current + 1 < prev.max } : null)
      return newCategory
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category'
      setError(errorMessage)
      console.error('Error creating category:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [gameId])

  const updateCategory = useCallback(async (categoryId: string, categoryData: UpdateCategoryRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedCategory = await categoriesApi.updateCategory(categoryId, categoryData)
      setCategories(prev => prev.map(cat => cat.id === categoryId ? updatedCategory : cat))
      return updatedCategory
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category'
      setError(errorMessage)
      console.error('Error updating category:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteCategory = useCallback(async (categoryId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await categoriesApi.deleteCategory(categoryId)
      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
      setLimits(prev => prev ? { ...prev, current: prev.current - 1, canCreate: prev.current - 1 < prev.max } : null)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category'
      setError(errorMessage)
      console.error('Error deleting category:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reorderCategories = useCallback(async (reorderData: ReorderCategoriesRequest) => {
    if (!gameId) {
      setError('Game ID is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const reorderedCategories = await categoriesApi.reorderCategories(gameId, reorderData)
      setCategories(reorderedCategories)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder categories'
      setError(errorMessage)
      console.error('Error reordering categories:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [gameId])

  const duplicateCategory = useCallback(async (categoryId: string, newName?: string) => {
    if (!gameId) {
      setError('Game ID is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const duplicatedCategory = await categoriesApi.duplicateCategory(categoryId, newName)
      setCategories(prev => [...prev, duplicatedCategory])
      setLimits(prev => prev ? { ...prev, current: prev.current + 1, canCreate: prev.current + 1 < prev.max } : null)
      return duplicatedCategory
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate category'
      setError(errorMessage)
      console.error('Error duplicating category:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [gameId])

  const checkLimits = useCallback(async () => {
    if (!gameId) {
      setLimits(null)
      return
    }

    try {
      const limitsData = await categoriesApi.checkCategoryLimits(gameId)
      setLimits(limitsData)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check limits'
      setError(errorMessage)
      console.error('Error checking limits:', err)
    }
  }, [gameId])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    categories,
    isLoading,
    error,
    limits,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    duplicateCategory,
    checkLimits,
  }
}

export function useCategory(categoryId: string | null) {
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCategory = useCallback(async () => {
    if (!categoryId) {
      setCategory(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const categoryData = await categoriesApi.getCategory(categoryId)
      setCategory(categoryData)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load category'
      setError(errorMessage)
      console.error('Error loading category:', err)
    } finally {
      setIsLoading(false)
    }
  }, [categoryId])

  const updateCategory = useCallback(async (categoryData: UpdateCategoryRequest) => {
    if (!categoryId) {
      setError('Category ID is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const updatedCategory = await categoriesApi.updateCategory(categoryId, categoryData)
      setCategory(updatedCategory)
      return updatedCategory
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category'
      setError(errorMessage)
      console.error('Error updating category:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [categoryId])

  useEffect(() => {
    loadCategory()
  }, [loadCategory])

  return {
    category,
    isLoading,
    error,
    loadCategory,
    updateCategory,
  }
}
