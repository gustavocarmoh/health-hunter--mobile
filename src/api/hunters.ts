import { httpClient } from './client'

export interface PublicProfile {
  id: string
  name: string
  rank_level: string
  xp: number
  city: string | null
  region_state: string | null
}

export interface HunterSearchResult {
  id: string
  name: string
  rank: string
  xp: number
}

const huntersApi = {
  async search(query: string, limit: number = 20): Promise<HunterSearchResult[]> {
    const response = await httpClient.get<{ results: HunterSearchResult[] }>('/hunters/search', {
      params: { q: query, limit },
    })
    return response.data.results
  },

  async allocateStat(attribute: string): Promise<{ stats: Record<string, number> }> {
    const response = await httpClient.post<{ stats: Record<string, number> }>(
      '/hunters/stats/allocate',
      { attribute }
    )
    return response.data
  },

  async getPublicProfile(userId: string): Promise<PublicProfile> {
    const response = await httpClient.get<PublicProfile>(`/hunters/${userId}/profile`)
    return response.data
  },
}

export default huntersApi
