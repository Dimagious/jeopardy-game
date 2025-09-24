import { supabase } from './supabaseClient'
import { 
  Game, 
  CreateGameRequest, 
  UpdateGameRequest, 
  GameListFilters, 
  GameListResponse 
} from './types'

// Функция для маппинга данных из базы в формат TypeScript
function mapGameFromDb(dbGame: Record<string, unknown>): Game {
  return {
    id: dbGame.id as string,
    orgId: dbGame.org_id as string,
    title: dbGame.title as string,
    description: (dbGame.description as string) || '',
    status: dbGame.status as 'draft' | 'active' | 'completed' | 'archived',
    settings: {
      gridRows: 5,
      gridCols: 5,
      maxTeams: 4,
      gameMode: 'jeopardy' as const,
      ...(dbGame.settings as Record<string, unknown>)
    },
    createdBy: dbGame.created_by as string,
    createdAt: dbGame.created_at as string,
    updatedAt: dbGame.updated_at as string
  }
}

// API для работы с играми
export class GamesApi {
  // Получить список игр организации
  static async getGames(
    orgId: string, 
    filters: GameListFilters = {}
  ): Promise<GameListResponse> {
    const {
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = filters

    let query = supabase
      .from('games')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)

    // Фильтр по статусу
    if (status && status.length > 0) {
      query = query.in('status', status)
    }

    // Поиск по названию
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    // Сортировка
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Пагинация
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch games: ${error.message}`)
    }

    return {
      games: (data || []).map(mapGameFromDb),
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > page * limit
    }
  }

  // Получить игру по ID
  static async getGame(gameId: string): Promise<Game> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch game: ${error.message}`)
    }

    return mapGameFromDb(data)
  }

  // Создать новую игру
  static async createGame(
    orgId: string, 
    userId: string, 
    gameData: CreateGameRequest
  ): Promise<Game> {
    const { data, error } = await supabase
      .from('games')
      .insert({
        org_id: orgId,
        title: gameData.title,
        description: gameData.description,
        settings: gameData.settings,
        created_by: userId,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create game: ${error.message}`)
    }

    return mapGameFromDb(data)
  }

  // Обновить игру
  static async updateGame(
    gameId: string, 
    updates: UpdateGameRequest
  ): Promise<Game> {
    const { data, error } = await supabase
      .from('games')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', gameId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update game: ${error.message}`)
    }

    return mapGameFromDb(data)
  }

  // Удалить игру (жесткое удаление)
  static async deleteGame(gameId: string): Promise<void> {
    // Сначала удаляем связанные данные (каскадное удаление)
    // Сначала получаем ID категорий для этой игры
    const { data: categoryIds, error: categoryIdsError } = await supabase
      .from('categories')
      .select('id')
      .eq('game_id', gameId)

    if (categoryIdsError) {
      throw new Error(`Failed to get category IDs: ${categoryIdsError.message}`)
    }

    // Удаляем вопросы, если есть категории
    if (categoryIds && categoryIds.length > 0) {
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .in('category_id', categoryIds.map(c => c.id))

      if (questionsError) {
        throw new Error(`Failed to delete questions: ${questionsError.message}`)
      }
    }

    // Удаляем категории
    const { error: categoriesError } = await supabase
      .from('categories')
      .delete()
      .eq('game_id', gameId)

    if (categoriesError) {
      throw new Error(`Failed to delete categories: ${categoriesError.message}`)
    }

    // Удаляем команды
    const { error: teamsError } = await supabase
      .from('teams')
      .delete()
      .eq('game_id', gameId)

    if (teamsError) {
      throw new Error(`Failed to delete teams: ${teamsError.message}`)
    }

    // Наконец, удаляем саму игру
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', gameId)

    if (error) {
      throw new Error(`Failed to delete game: ${error.message}`)
    }
  }

  // Дублировать игру
  static async duplicateGame(
    gameId: string, 
    newTitle: string
  ): Promise<Game> {
    // Получаем оригинальную игру
    const originalGame = await this.getGame(gameId)
    
    // Создаем копию
    const { data, error } = await supabase
      .from('games')
      .insert({
        org_id: originalGame.orgId,
        title: newTitle,
        description: originalGame.description,
        settings: originalGame.settings,
        created_by: originalGame.createdBy,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to duplicate game: ${error.message}`)
    }

    return mapGameFromDb(data)
  }

  // Проверить лимиты плана
  static async checkPlanLimits(orgId: string): Promise<{
    currentGames: number
    maxGames: number
    canCreate: boolean
  }> {
    // Получаем текущее количество игр
    const { count: currentGames } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .neq('status', 'archived')

    // Получаем план организации
    const { data: orgPlan } = await supabase
      .from('org_plans')
      .select('plan_id')
      .eq('org_id', orgId)
      .eq('active', true)
      .single()

    // Получаем лимиты плана
    const { data: plan } = await supabase
      .from('plans')
      .select('caps')
      .eq('id', orgPlan?.plan_id || 'free')
      .single()

    const maxGames = plan?.caps?.maxGames || 3
    const canCreate = (currentGames || 0) < maxGames

    return {
      currentGames: currentGames || 0,
      maxGames,
      canCreate
    }
  }
}
