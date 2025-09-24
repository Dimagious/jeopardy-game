import { useState, useEffect, useCallback } from 'react'
import { questionsApi } from './questionsApi'
import { Question, CreateQuestionRequest, UpdateQuestionRequest, MoveQuestionRequest } from './types'

export function useQuestions(categoryId: string | null) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadQuestions = useCallback(async () => {
    if (!categoryId) {
      setQuestions([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const questionsData = await questionsApi.getQuestions(categoryId)
      setQuestions(questionsData)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load questions'
      setError(errorMessage)
      console.error('Error loading questions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [categoryId])

  const createQuestion = useCallback(async (questionData: CreateQuestionRequest) => {
    if (!categoryId) {
      setError('Category ID is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const newQuestion = await questionsApi.createQuestion(categoryId, questionData)
      setQuestions(prev => [...prev, newQuestion])
      return newQuestion
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create question'
      setError(errorMessage)
      console.error('Error creating question:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [categoryId])

  const updateQuestion = useCallback(async (questionId: string, questionData: UpdateQuestionRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedQuestion = await questionsApi.updateQuestion(questionId, questionData)
      setQuestions(prev => prev.map(q => q.id === questionId ? updatedQuestion : q))
      return updatedQuestion
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update question'
      setError(errorMessage)
      console.error('Error updating question:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteQuestion = useCallback(async (questionId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await questionsApi.deleteQuestion(questionId)
      setQuestions(prev => prev.filter(q => q.id !== questionId))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete question'
      setError(errorMessage)
      console.error('Error deleting question:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const moveQuestion = useCallback(async (questionId: string, moveData: MoveQuestionRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      const movedQuestion = await questionsApi.moveQuestion(questionId, moveData)
      setQuestions(prev => prev.filter(q => q.id !== questionId))
      return movedQuestion
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move question'
      setError(errorMessage)
      console.error('Error moving question:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reorderQuestions = useCallback(async (questionIds: string[]) => {
    if (!categoryId) {
      setError('Category ID is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const reorderedQuestions = await questionsApi.reorderQuestions(categoryId, questionIds)
      setQuestions(reorderedQuestions)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder questions'
      setError(errorMessage)
      console.error('Error reordering questions:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [categoryId])

  const duplicateQuestion = useCallback(async (questionId: string, targetCategoryId?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const duplicatedQuestion = await questionsApi.duplicateQuestion(questionId, targetCategoryId)
      if (targetCategoryId === categoryId || !targetCategoryId) {
        setQuestions(prev => [...prev, duplicatedQuestion])
      }
      return duplicatedQuestion
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate question'
      setError(errorMessage)
      console.error('Error duplicating question:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [categoryId])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  return {
    questions,
    isLoading,
    error,
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
    reorderQuestions,
    duplicateQuestion,
  }
}

export function useQuestionsByGame(gameId: string | null) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limits, setLimits] = useState<{ current: number; max: number; canCreate: boolean } | null>(null)

  const loadQuestions = useCallback(async () => {
    if (!gameId) {
      setQuestions([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [questionsData, limitsData] = await Promise.all([
        questionsApi.getQuestionsByGame(gameId),
        questionsApi.checkQuestionLimits(gameId)
      ])

      setQuestions(questionsData)
      setLimits(limitsData)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load questions'
      setError(errorMessage)
      console.error('Error loading questions:', err)
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
      const limitsData = await questionsApi.checkQuestionLimits(gameId)
      setLimits(limitsData)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check limits'
      setError(errorMessage)
      console.error('Error checking limits:', err)
    }
  }, [gameId])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  return {
    questions,
    isLoading,
    error,
    limits,
    loadQuestions,
    checkLimits,
  }
}

export function useQuestion(questionId: string | null) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadQuestion = useCallback(async () => {
    if (!questionId) {
      setQuestion(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const questionData = await questionsApi.getQuestion(questionId)
      setQuestion(questionData)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load question'
      setError(errorMessage)
      console.error('Error loading question:', err)
    } finally {
      setIsLoading(false)
    }
  }, [questionId])

  const updateQuestion = useCallback(async (questionData: UpdateQuestionRequest) => {
    if (!questionId) {
      setError('Question ID is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const updatedQuestion = await questionsApi.updateQuestion(questionId, questionData)
      setQuestion(updatedQuestion)
      return updatedQuestion
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update question'
      setError(errorMessage)
      console.error('Error updating question:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [questionId])

  useEffect(() => {
    loadQuestion()
  }, [loadQuestion])

  return {
    question,
    isLoading,
    error,
    loadQuestion,
    updateQuestion,
  }
}
