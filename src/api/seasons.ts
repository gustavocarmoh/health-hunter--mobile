import { httpClient } from './client'

export interface Season {
  id: string
  title: string
  description: string
  starts_at: string
  ends_at: string
  xp_multiplier: number
  is_active: boolean
  created_at: string
}

export interface SeasonLeaderboardEntry {
  position: number
  hunter_id: string
  name: string
  rank: string
  total_xp_this_season: number
}

const seasonsApi = {
  async getCurrent(): Promise<{ active: boolean; season: Season | null }> {
    const response = await httpClient.get<{ active: boolean; season: Season | null }>(
      '/seasons/current',
    )
    return response.data
  },

  async getById(id: string): Promise<Season> {
    const response = await httpClient.get<Season>(`/seasons/${id}`)
    return response.data
  },

  async getLeaderboard(id: string, page: number = 1, limit: number = 100): Promise<{
    season_id: string
    season_title: string
    leaderboard: SeasonLeaderboardEntry[]
  }> {
    const response = await httpClient.get<{
      season_id: string
      season_title: string
      leaderboard: SeasonLeaderboardEntry[]
    }>(`/seasons/${id}/leaderboard`, { params: { page, limit } })
    return response.data
  },

  async getAllArchived(page: number = 1, limit: number = 20): Promise<{
    seasons: Season[]
    total: number
  }> {
    const response = await httpClient.get<{ seasons: Season[]; total: number }>(
      '/seasons/archived',
      { params: { page, limit } },
    )
    return response.data
  },
}

export default seasonsApi
