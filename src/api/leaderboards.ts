import { httpClient } from './client'

export interface LeaderboardEntry {
  position: number
  hunter_id: string
  name: string
  rank: string
  xp: number
  missions_completed?: number
  title?: string
}

export interface Leaderboard {
  scope: 'global' | 'regional' | 'local'
  leaderboard: LeaderboardEntry[]
  total_entries?: number
  user_position?: number
}

export interface MyPosition {
  hunter_id: string
  xp: number
  rank_level: string
  total_hunters: number
  positions: {
    global: number
    regional: number
    local: number
  }
}

const leaderboardsApi = {
  async getGlobal(page: number = 1, limit: number = 50): Promise<Leaderboard> {
    const response = await httpClient.get<Leaderboard>('/leaderboards/global', {
      params: { page, limit },
    })
    return response.data
  },

  /** Posição real do hunter autenticado — usada pro card "#posição / TOP %" do ranking. */
  async getMyPosition(): Promise<MyPosition> {
    const response = await httpClient.get<MyPosition>('/leaderboards/me')
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

  /** Ranking só de quem o hunter realmente segue — vem de /leaderboards/friends, não de um
   * filtro por nome no ranking global (nomes não são únicos, então isso dava resultado errado
   * quando duas contas tinham o mesmo nome de exibição). */
  async getFriends(): Promise<{ total: number; leaderboard: LeaderboardEntry[] }> {
    const response = await httpClient.get<{ total: number; leaderboard: any[] }>(
      '/leaderboards/friends',
    )
    return {
      total: response.data.total,
      leaderboard: response.data.leaderboard.map((e) => ({
        position: e.position,
        hunter_id: e.hunter_id,
        name: e.name,
        rank: e.rank_level,
        xp: e.xp,
        missions_completed: e.missions_completed,
      })),
    }
  },
}

export default leaderboardsApi
