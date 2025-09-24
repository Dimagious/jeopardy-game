import { supabase } from './supabaseClient'
import { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  ReorderCategoriesRequest 
} from './types'

export class CategoriesApi {
  /**
   * Получить все категории для игры
   */
  async getCategories(gameId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('game_id', gameId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data as Category[]
  }

  /**
   * Получить категорию по ID
   */
  async getCategory(categoryId: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (error) throw error
    return data as Category
  }

  /**
   * Создать новую категорию
   */
  async createCategory(gameId: string, categoryData: CreateCategoryRequest): Promise<Category> {
    // Получаем максимальный порядок для автоматического назначения
    const { data: maxOrderData } = await supabase
      .from('categories')
      .select('order_index')
      .eq('game_id', gameId)
      .order('order_index', { ascending: false })
      .limit(1)

    const maxOrder = maxOrderData?.[0]?.order_index || 0
    const order = categoryData.order ?? (maxOrder + 1)

    const { data, error } = await supabase
      .from('categories')
      .insert({
        game_id: gameId,
        name: categoryData.name,
        color: categoryData.color,
        order,
      })
      .select()
      .single()

    if (error) throw error
    return data as Category
  }

  /**
   * Обновить категорию
   */
  async updateCategory(categoryId: string, categoryData: UpdateCategoryRequest): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({
        ...categoryData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', categoryId)
      .select()
      .single()

    if (error) throw error
    return data as Category
  }

  /**
   * Удалить категорию
   */
  async deleteCategory(categoryId: string): Promise<void> {
    // Сначала удаляем все вопросы в категории
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .eq('category_id', categoryId)

    if (questionsError) throw questionsError

    // Затем удаляем саму категорию
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) throw error
  }

  /**
   * Изменить порядок категорий
   */
  async reorderCategories(gameId: string, reorderData: ReorderCategoriesRequest): Promise<Category[]> {
    const updates = reorderData.categoryIds.map((categoryId, index) => ({
      id: categoryId,
      order: index + 1,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('categories')
      .upsert(updates)
      .select()

    if (error) throw error

    // Получаем обновленные категории для игры
    const { data: updatedCategories, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('game_id', gameId)
      .order('order_index', { ascending: true })

    if (fetchError) throw fetchError
    return updatedCategories as Category[]
  }

  /**
   * Дублировать категорию
   */
  async duplicateCategory(categoryId: string, newName?: string): Promise<Category> {
    // Получаем оригинальную категорию
    const originalCategory = await this.getCategory(categoryId)
    
    // Получаем максимальный порядок
    const { data: maxOrderData } = await supabase
      .from('categories')
      .select('order_index')
      .eq('game_id', originalCategory.gameId)
      .order('order_index', { ascending: false })
      .limit(1)

    const maxOrder = maxOrderData?.[0]?.order_index || 0

    // Создаем дубликат
    const { data, error } = await supabase
      .from('categories')
      .insert({
        game_id: originalCategory.gameId,
        name: newName || `${originalCategory.name} (Copy)`,
        color: originalCategory.color,
        order: maxOrder + 1,
      })
      .select()
      .single()

    if (error) throw error

    // Дублируем все вопросы из оригинальной категории
    const { data: originalQuestions } = await supabase
      .from('questions')
      .select('*')
      .eq('category_id', categoryId)
      .order('order_index', { ascending: true })

    if (originalQuestions && originalQuestions.length > 0) {
      const duplicatedQuestions = originalQuestions.map((question, index) => ({
        category_id: data.id,
        value: question.value,
        text: question.text,
        answer: question.answer,
        order: index + 1,
        is_locked: false,
        is_done: false,
      }))

      await supabase
        .from('questions')
        .insert(duplicatedQuestions)
    }

    return data as Category
  }

  /**
   * Проверить лимиты плана для категорий
   */
  async checkCategoryLimits(gameId: string): Promise<{ current: number; max: number; canCreate: boolean }> {
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

    const caps = (planData?.caps as { maxCategories?: number }) || {}
    const maxCategories = caps.maxCategories || 5 // Free plan limit

    // Считаем текущее количество категорий
    const { count, error: countError } = await supabase
      .from('categories')
      .select('id', { count: 'exact' })
      .eq('game_id', gameId)

    if (countError) throw countError

    const current = count || 0

    return {
      current,
      max: maxCategories,
      canCreate: current < maxCategories,
    }
  }
}

export const categoriesApi = new CategoriesApi()
