import { supabase } from './supabaseClient'
import { Team, CreateTeamRequest, UpdateTeamRequest, ReorderTeamsRequest, TeamLimits } from './types'

export class TeamsApi {
  /**
   * Получить все команды для игры
   */
  static async getTeams(gameId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('game_id', gameId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data as Team[]
  }

  /**
   * Получить одну команду по ID
   */
  static async getTeam(teamId: string): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (error) throw error
    return data as Team
  }

  /**
   * Создать новую команду
   */
  static async createTeam(gameId: string, teamData: CreateTeamRequest): Promise<Team> {
    // Получаем максимальный порядок для автоматического назначения
    const { data: maxOrderData, error: maxOrderError } = await supabase
      .from('teams')
      .select('order_index')
      .eq('game_id', gameId)
      .order('order_index', { ascending: false })
      .limit(1)

    if (maxOrderError) throw maxOrderError

    const maxOrder = maxOrderData?.[0]?.order_index || 0
    const order = teamData.order ?? maxOrder + 1

    const { data, error } = await supabase
      .from('teams')
      .insert({
        game_id: gameId,
        name: teamData.name,
        color: teamData.color,
        order_index: order
      })
      .select()
      .single()

    if (error) throw error
    return data as Team
  }

  /**
   * Обновить команду
   */
  static async updateTeam(teamId: string, teamData: UpdateTeamRequest): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .update({
        name: teamData.name,
        color: teamData.color,
        order_index: teamData.order
      })
      .eq('id', teamId)
      .select()
      .single()

    if (error) throw error
    return data as Team
  }

  /**
   * Удалить команду
   */
  static async deleteTeam(teamId: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)

    if (error) throw error
  }

  /**
   * Изменить порядок команд
   */
  static async reorderTeams(gameId: string, reorderData: ReorderTeamsRequest): Promise<Team[]> {
    // Обновляем порядок команд
    const updates = reorderData.teamIds.map((teamId, index) => ({
      id: teamId,
      order_index: index + 1
    }))

    for (const update of updates) {
      const { error } = await supabase
        .from('teams')
        .update({ order_index: update.order_index })
        .eq('id', update.id)

      if (error) throw error
    }

    // Возвращаем обновленный список команд
    return this.getTeams(gameId)
  }

  /**
   * Дублировать команду
   */
  static async duplicateTeam(teamId: string, newName?: string): Promise<Team> {
    const team = await this.getTeam(teamId)
    
    const duplicateData: CreateTeamRequest = {
      name: newName || `${team.name} (Copy)`,
      color: team.color,
      order: team.order + 1
    }

    return this.createTeam(team.gameId, duplicateData)
  }

  /**
   * Проверить лимиты плана для команд
   */
  static async checkTeamLimits(gameId: string): Promise<TeamLimits> {
    // Получаем количество команд для игры
    const { count, error: countError } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId)

    if (countError) throw countError

    // Получаем лимиты плана (пока используем фиксированные значения)
    // TODO: Интегрировать с системой планов
    const maxTeams = 8 // Pro план
    const current = count || 0

    return {
      current,
      max: maxTeams,
      canCreate: current < maxTeams
    }
  }
}
