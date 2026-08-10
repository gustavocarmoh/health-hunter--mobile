import { httpClient } from './client'

export interface LeaderboardEntry {
  position: number
  hunter_id: string
  name: string
  rank: string
  xp: number
  title?: string
}

export interface Leaderboard {
  scope: 'global' | 'regional' | 'local'
  leaderboard: LeaderboardEntry[]
  total_entries?: number
  user_position?: number
}

const leaderboardsApi = {
  async getGlobal(page: number = 1, limit: number = 50): Promise<Leaderboard> {
    const response = await httpClient.get<Leaderboard>('/leaderboards/global', {
      params: { page, limit },
    })
    return response.data
  },

  async getRegional(page: number = 1, limit: number = 50): Promise<Leaderboard> {
    const response = await httpClient.get<Leaderboard>('/leaderboards/regional', {
      params: { page, limit },
    })
    return response.data
  },

  async getLocal(page: number = 1, limit: number = 50): Promise<Leaderboard> {
    const response = await httpClient.get<Leaderboard>('/leaderboards/local', {
      params: { page, limit },
    })
    return response.data
  },
}

export default leaderboardsApi
