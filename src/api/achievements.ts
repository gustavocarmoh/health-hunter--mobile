import { httpClient } from './client'
import { Achievement } from '../state/types'

/** O backend não tem conceito de raridade — deriva um tier visual a partir do XP de recompensa. */
function rarityFromXp(xp: number): Achievement['rarity'] {
  if (xp >= 600) return 'LEGENDARY'
  if (xp >= 300) return 'EPIC'
  if (xp >= 100) return 'RARE'
  return 'COMMON'
}

/** Backend usa "title", não "name" — mapear errado deixava toda conquista sem nome. */
function mapAchievement(a: any, unlocked: boolean): Achievement {
  const xp = a.xp_reward || 0
  const targetValue = a.condition_value ?? 0
  const currentValue = a.current_value ?? 0
  return {
    id: a.id,
    name: a.title,
    desc: a.description || '',
    icon: a.icon || '🏆',
    rarity: rarityFromXp(xp),
    xp,
    unlocked,
    conditionType: a.condition_type,
    currentValue,
    targetValue,
    // /achievements (catálogo, sem progresso do hunter) não manda current_value — fica 0%.
    progressPct: a.progress_pct ?? 0,
  }
}

const achievementsApi = {
  async getCatalog(): Promise<Achievement[]> {
    const response = await httpClient.get<{ achievements: any[] }>('/achievements')
    return response.data.achievements.map((a) => mapAchievement(a, false))
  },

  async getMyAchievements(): Promise<Achievement[]> {
    const response = await httpClient.get<{ achievements: any[] }>('/achievements/mine')
    return response.data.achievements.map((a) => mapAchievement(a, a.is_unlocked || false))
  },
}

export default achievementsApi
