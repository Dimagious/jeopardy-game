import { supabase } from './supabaseClient'
import { 
  QuestionPack, 
  PackCategory, 
  PackQuestion, 
  CreatePackRequest, 
  UpdatePackRequest, 
  PackPreview, 
  PackImportRequest, 
  PackFilters 
} from './types'

export class PacksApi {
  /**
   * Получить все пакеты для организации
   */
  static async getPacks(orgId: string, filters: PackFilters = {}): Promise<QuestionPack[]> {
    let query = supabase
      .from('question_packs')
      .select('*')
      .eq('org_id', orgId)

    // Применяем фильтры
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    if (filters.isPublic !== undefined) {
      query = query.eq('is_public', filters.isPublic)
    }

    // Сортировка
    const sortBy = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder || 'desc'
    query = query.order(sortBy === 'createdAt' ? 'created_at' : sortBy === 'updatedAt' ? 'updated_at' : 'title', { 
      ascending: sortOrder === 'asc' 
    })

    // Пагинация
    if (filters.page && filters.limit) {
      const from = (filters.page - 1) * filters.limit
      const to = from + filters.limit - 1
      query = query.range(from, to)
    }

    const { data, error } = await query

    if (error) throw error
    return data as QuestionPack[]
  }

  /**
   * Получить один пакет по ID
   */
  static async getPack(packId: string): Promise<QuestionPack> {
    const { data, error } = await supabase
      .from('question_packs')
      .select('*')
      .eq('id', packId)
      .single()

    if (error) throw error
    return data as QuestionPack
  }

  /**
   * Получить предпросмотр пакета с категориями и вопросами
   */
  static async getPackPreview(packId: string): Promise<PackPreview> {
    // Получаем пакет
    const pack = await this.getPack(packId)

    // Получаем категории пакета
    const { data: categories, error: categoriesError } = await supabase
      .from('pack_categories')
      .select('*')
      .eq('pack_id', packId)
      .order('order_index', { ascending: true })

    if (categoriesError) throw categoriesError

    // Получаем вопросы пакета
    const { data: questions, error: questionsError } = await supabase
      .from('pack_questions')
      .select('*')
      .in('pack_category_id', categories.map(c => c.id))
      .order('order_index', { ascending: true })

    if (questionsError) throw questionsError

    // Вычисляем статистику
    const stats = {
      categoriesCount: categories.length,
      questionsCount: questions.length,
      totalValue: questions.reduce((sum, q) => sum + q.value, 0),
      averageValue: questions.length > 0 ? questions.reduce((sum, q) => sum + q.value, 0) / questions.length : 0
    }

    return {
      pack,
      categories: categories as PackCategory[],
      questions: questions as PackQuestion[],
      stats
    }
  }

  /**
   * Создать новый пакет
   */
  static async createPack(orgId: string, packData: CreatePackRequest): Promise<QuestionPack> {
    const { data, error } = await supabase
      .from('question_packs')
      .insert({
        org_id: orgId,
        title: packData.title,
        description: packData.description,
        is_public: packData.isPublic || false,
        tags: packData.tags || []
      })
      .select()
      .single()

    if (error) throw error
    return data as QuestionPack
  }

  /**
   * Обновить пакет
   */
  static async updatePack(packId: string, packData: UpdatePackRequest): Promise<QuestionPack> {
    const { data, error } = await supabase
      .from('question_packs')
      .update({
        title: packData.title,
        description: packData.description,
        is_public: packData.isPublic,
        tags: packData.tags
      })
      .eq('id', packId)
      .select()
      .single()

    if (error) throw error
    return data as QuestionPack
  }

  /**
   * Удалить пакет
   */
  static async deletePack(packId: string): Promise<void> {
    // Сначала удаляем связанные данные (каскадное удаление)
    // Удаляем вопросы пакета
    const { data: categoryIds, error: categoryIdsError } = await supabase
      .from('pack_categories')
      .select('id')
      .eq('pack_id', packId)

    if (categoryIdsError) {
      throw new Error(`Failed to get category IDs: ${categoryIdsError.message}`)
    }

    if (categoryIds && categoryIds.length > 0) {
      const { error: questionsError } = await supabase
        .from('pack_questions')
        .delete()
        .in('pack_category_id', categoryIds.map(c => c.id))

      if (questionsError) {
        throw new Error(`Failed to delete pack questions: ${questionsError.message}`)
      }
    }

    // Удаляем категории пакета
    const { error: categoriesError } = await supabase
      .from('pack_categories')
      .delete()
      .eq('pack_id', packId)

    if (categoriesError) {
      throw new Error(`Failed to delete pack categories: ${categoriesError.message}`)
    }

    // Удаляем сам пакет
    const { error } = await supabase
      .from('question_packs')
      .delete()
      .eq('id', packId)

    if (error) {
      throw new Error(`Failed to delete pack: ${error.message}`)
    }
  }

  /**
   * Дублировать пакет
   */
  static async duplicatePack(packId: string, newTitle?: string): Promise<QuestionPack> {
    const preview = await this.getPackPreview(packId)
    
    // Создаем новый пакет
    const packData: CreatePackRequest = {
      title: newTitle || `${preview.pack.title} (Copy)`,
      isPublic: false,
      tags: preview.pack.tags
    }
    
    if (preview.pack.description) {
      packData.description = preview.pack.description
    }
    
    const newPack = await this.createPack(preview.pack.orgId, packData)

    // Копируем категории
    for (const category of preview.categories) {
      const { data: newCategory, error: categoryError } = await supabase
        .from('pack_categories')
        .insert({
          pack_id: newPack.id,
          name: category.name,
          color: category.color,
          order_index: category.order
        })
        .select()
        .single()

      if (categoryError) throw categoryError

      // Копируем вопросы этой категории
      const categoryQuestions = preview.questions.filter(q => q.packCategoryId === category.id)
      for (const question of categoryQuestions) {
        const { error: questionError } = await supabase
          .from('pack_questions')
          .insert({
            pack_category_id: newCategory.id,
            value: question.value,
            text: question.text,
            answer: question.answer,
            order_index: question.order
          })

        if (questionError) throw questionError
      }
    }

    return newPack
  }

  /**
   * Импортировать пакет в игру
   */
  static async importPackToGame(importData: PackImportRequest): Promise<void> {
    const preview = await this.getPackPreview(importData.packId)

    // Создаем категории в игре
    const categoryMap = new Map<string, string>() // packCategoryId -> gameCategoryId

    for (const packCategory of preview.categories) {
      const { data: gameCategory, error: categoryError } = await supabase
        .from('categories')
        .insert({
          game_id: importData.gameId,
          name: packCategory.name,
          color: packCategory.color,
          order_index: packCategory.order
        })
        .select()
        .single()

      if (categoryError) throw categoryError
      categoryMap.set(packCategory.id, gameCategory.id)
    }

    // Создаем вопросы в игре
    for (const packQuestion of preview.questions) {
      const gameCategoryId = categoryMap.get(packQuestion.packCategoryId)
      if (!gameCategoryId) continue

      const { error: questionError } = await supabase
        .from('questions')
        .insert({
          category_id: gameCategoryId,
          value: packQuestion.value,
          text: packQuestion.text,
          answer: packQuestion.answer,
          order_index: packQuestion.order
        })

      if (questionError) throw questionError
    }
  }

  /**
   * Экспортировать игру как пакет
   */
  static async exportGameAsPack(gameId: string, packData: CreatePackRequest): Promise<QuestionPack> {
    // Получаем данные игры
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('org_id')
      .eq('id', gameId)
      .single()

    if (gameError) throw gameError

    // Создаем пакет
    const pack = await this.createPack(game.org_id, packData)

    // Получаем категории игры
    const { data: gameCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('game_id', gameId)
      .order('order_index', { ascending: true })

    if (categoriesError) throw categoriesError

    // Создаем категории пакета
    const categoryMap = new Map<string, string>() // gameCategoryId -> packCategoryId

    for (const gameCategory of gameCategories) {
      const { data: packCategory, error: packCategoryError } = await supabase
        .from('pack_categories')
        .insert({
          pack_id: pack.id,
          name: gameCategory.name,
          color: gameCategory.color,
          order_index: gameCategory.order_index
        })
        .select()
        .single()

      if (packCategoryError) throw packCategoryError
      categoryMap.set(gameCategory.id, packCategory.id)
    }

    // Получаем вопросы игры
    const { data: gameQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .in('category_id', gameCategories.map(c => c.id))
      .order('order_index', { ascending: true })

    if (questionsError) throw questionsError

    // Создаем вопросы пакета
    for (const gameQuestion of gameQuestions) {
      const packCategoryId = categoryMap.get(gameQuestion.category_id)
      if (!packCategoryId) continue

      const { error: packQuestionError } = await supabase
        .from('pack_questions')
        .insert({
          pack_category_id: packCategoryId,
          value: gameQuestion.value,
          text: gameQuestion.text,
          answer: gameQuestion.answer,
          order_index: gameQuestion.order_index
        })

      if (packQuestionError) throw packQuestionError
    }

    return pack
  }

  /**
   * Получить все доступные теги
   */
  static async getAvailableTags(orgId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('question_packs')
      .select('tags')
      .eq('org_id', orgId)

    if (error) throw error

    const allTags = data.flatMap(pack => pack.tags || [])
    return [...new Set(allTags)].sort()
  }
}
