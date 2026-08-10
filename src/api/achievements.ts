import { httpClient } from './client'
import { Achievement } from '../state/types'

const achievementsApi = {
  async getCatalog(): Promise<Achievement[]> {
    const response = await httpClient.get<{ achievements: any[] }>('/achievements')
    return response.data.achievements.map((a: any) => ({
      id: a.id,
      name: a.name,
      desc: a.description || '',
      icon: a.icon || '🏆',
      rarity: a.rarity || 'COMMON',
      xp: a.xp_reward || 0,
      unlocked: false,
    }))
  },

  async getMyAchievements(): Promise<Achievement[]> {
    const response = await httpClient.get<{ achievements: any[] }>('/achievements/mine')
    return response.data.achievements.map((a: any) => ({
      id: a.id,
      name: a.name,
      desc: a.description || '',
      icon: a.icon || '🏆',
      rarity: a.rarity || 'COMMON',
      xp: a.xp_reward || 0,
      unlocked: a.is_unlocked || false,
    }))
  },
}

export default achievementsApi
