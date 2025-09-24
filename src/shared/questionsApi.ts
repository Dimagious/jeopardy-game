import { supabase } from './supabaseClient'
import { 
  Question, 
  CreateQuestionRequest, 
  UpdateQuestionRequest, 
  MoveQuestionRequest 
} from './types'

export class QuestionsApi {
  /**
   * Получить все вопросы для категории
   */
  async getQuestions(categoryId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('category_id', categoryId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data as Question[]
  }

  /**
   * Получить все вопросы для игры
   */
  async getQuestionsByGame(gameId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        categories!inner(game_id)
      `)
      .eq('categories.game_id', gameId)
      .order('order_index', { ascending: true })

    console.log('🔍 questionsApi.getQuestionsByGame - raw data:', data)
    if (data && data.length > 0) {
      console.log('🔍 questionsApi.getQuestionsByGame - first item keys:', Object.keys(data[0]))
    }

    if (error) throw error
    return data as Question[]
  }

  /**
   * Получить вопрос по ID
   */
  async getQuestion(questionId: string): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (error) throw error
    return data as Question
  }

  /**
   * Создать новый вопрос
   */
  async createQuestion(categoryId: string, questionData: CreateQuestionRequest): Promise<Question> {
    // Проверяем уникальность стоимости в категории
    const { data: existingQuestion } = await supabase
      .from('questions')
      .select('id')
      .eq('category_id', categoryId)
      .eq('value', questionData.value)
      .single()

    if (existingQuestion) {
      throw new Error(`Question with value ${questionData.value} already exists in this category`)
    }

    // Получаем максимальный порядок для автоматического назначения
    const { data: maxOrderData } = await supabase
      .from('questions')
      .select('order_index')
      .eq('category_id', categoryId)
      .order('order_index', { ascending: false })
      .limit(1)

    const maxOrder = maxOrderData?.[0]?.order_index || 0
    const order = questionData.order ?? (maxOrder + 1)

    const { data, error } = await supabase
      .from('questions')
      .insert({
        category_id: categoryId,
        value: questionData.value,
        text: questionData.text,
        answer: questionData.answer,
        order,
        is_locked: false,
        is_done: false,
      })
      .select()
      .single()

    if (error) throw error
    return data as Question
  }

  /**
   * Обновить вопрос
   */
  async updateQuestion(questionId: string, questionData: UpdateQuestionRequest): Promise<Question> {
    // Если изменяется стоимость, проверяем уникальность
    if (questionData.value !== undefined) {
      const { data: currentQuestion } = await supabase
        .from('questions')
        .select('category_id')
        .eq('id', questionId)
        .single()

      if (currentQuestion) {
        const { data: existingQuestion } = await supabase
          .from('questions')
          .select('id')
          .eq('category_id', currentQuestion.category_id)
          .eq('value', questionData.value)
          .neq('id', questionId)
          .single()

        if (existingQuestion) {
          throw new Error(`Question with value ${questionData.value} already exists in this category`)
        }
      }
    }

    const { data, error } = await supabase
      .from('questions')
      .update({
        ...questionData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select()
      .single()

    if (error) throw error
    return data as Question
  }

  /**
   * Удалить вопрос
   */
  async deleteQuestion(questionId: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId)

    if (error) throw error
  }

  /**
   * Переместить вопрос в другую категорию
   */
  async moveQuestion(questionId: string, moveData: MoveQuestionRequest): Promise<Question> {
    // Проверяем уникальность стоимости в целевой категории
    const { data: currentQuestion } = await supabase
      .from('questions')
      .select('value')
      .eq('id', questionId)
      .single()

    if (currentQuestion) {
      const { data: existingQuestion } = await supabase
        .from('questions')
        .select('id')
        .eq('category_id', moveData.targetCategoryId)
        .eq('value', currentQuestion.value)
        .single()

      if (existingQuestion) {
        throw new Error(`Question with value ${currentQuestion.value} already exists in target category`)
      }
    }

    // Получаем максимальный порядок в целевой категории
    const { data: maxOrderData } = await supabase
      .from('questions')
      .select('order_index')
      .eq('category_id', moveData.targetCategoryId)
      .order('order_index', { ascending: false })
      .limit(1)

    const maxOrder = maxOrderData?.[0]?.order_index || 0
    const order = moveData.order ?? (maxOrder + 1)

    const { data, error } = await supabase
      .from('questions')
      .update({
        category_id: moveData.targetCategoryId,
        order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select()
      .single()

    if (error) throw error
    return data as Question
  }

  /**
   * Изменить порядок вопросов в категории
   */
  async reorderQuestions(categoryId: string, questionIds: string[]): Promise<Question[]> {
    const updates = questionIds.map((questionId, index) => ({
      id: questionId,
      order: index + 1,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('questions')
      .upsert(updates)
      .select()

    if (error) throw error

    // Получаем обновленные вопросы для категории
    const { data: updatedQuestions, error: fetchError } = await supabase
      .from('questions')
      .select('*')
      .eq('category_id', categoryId)
      .order('order_index', { ascending: true })

    if (fetchError) throw fetchError
    return updatedQuestions as Question[]
  }

  /**
   * Дублировать вопрос
   */
  async duplicateQuestion(questionId: string, targetCategoryId?: string): Promise<Question> {
    // Получаем оригинальный вопрос
    const originalQuestion = await this.getQuestion(questionId)
    
    // Определяем целевую категорию
    const categoryId = targetCategoryId || originalQuestion.categoryId

    // Получаем максимальный порядок в целевой категории
    const { data: maxOrderData } = await supabase
      .from('questions')
      .select('order_index')
      .eq('category_id', categoryId)
      .order('order_index', { ascending: false })
      .limit(1)

    const maxOrder = maxOrderData?.[0]?.order_index || 0

    // Создаем дубликат с уникальной стоимостью
    let newValue = originalQuestion.value
    let attempts = 0
    const maxAttempts = 100

    while (attempts < maxAttempts) {
      const { data: existingQuestion } = await supabase
        .from('questions')
        .select('id')
        .eq('category_id', categoryId)
        .eq('value', newValue)
        .single()

      if (!existingQuestion) break

      newValue += 100
      attempts++
    }

    if (attempts >= maxAttempts) {
      throw new Error('Unable to find unique value for duplicated question')
    }

    const { data, error } = await supabase
      .from('questions')
      .insert({
        category_id: categoryId,
        value: newValue,
        text: `${originalQuestion.text} (Copy)`,
        answer: originalQuestion.answer,
        order: maxOrder + 1,
        is_locked: false,
        is_done: false,
      })
      .select()
      .single()

    if (error) throw error
    return data as Question
  }

  /**
   * Проверить лимиты плана для вопросов
   */
  async checkQuestionLimits(gameId: string): Promise<{ current: number; max: number; canCreate: boolean }> {
    // Получаем игру для определения организации
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('org_id')
      .eq('id', gameId)
      .single()

    if (gameError) throw gameError

    // Получаем план организации
    const { data: orgPlanData } = await supabase
      .from('org_plans')
      .select('plan_id')
      .eq('org_id', gameData.org_id)
      .single()

    const planId = orgPlanData?.plan_id || 'free'

    // Получаем лимиты плана
    const { data: planData } = await supabase
      .from('plans')
      .select('caps')
      .eq('id', planId)
      .single()

    const caps = (planData?.caps as { maxQuestions?: number }) || {}
    const maxQuestions = caps.maxQuestions || 25 // Free plan limit

    // Считаем текущее количество вопросов
    // Получаем все категории игры
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id')
      .eq('game_id', gameId)

    if (!categoriesData || categoriesData.length === 0) {
      return {
        current: 0,
        max: maxQuestions,
        canCreate: true,
      }
    }

    const categoryIds = categoriesData.map(cat => cat.id)

    const { count, error: countError } = await supabase
      .from('questions')
      .select('id', { count: 'exact' })
      .in('category_id', categoryIds)

    if (countError) throw countError

    const current = count || 0

    return {
      current,
      max: maxQuestions,
      canCreate: current < maxQuestions,
    }
  }
}

export const questionsApi = new QuestionsApi()
