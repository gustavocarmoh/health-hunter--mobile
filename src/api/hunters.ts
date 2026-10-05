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

export interface PrivacyPolicy {
  version: string
  controller: string
  dpo: { name: string; email: string }
  data_collected: Array<{
    category: string
    purpose: string
    legal_basis: string
    retention: string
  }>
  rights: string[]
  incident_notice: string
}

const huntersApi = {
  async getPrivacyPolicy(): Promise<PrivacyPolicy> {
    const response = await httpClient.get<PrivacyPolicy>('/privacy')
    return response.data
  },

  // LGPD art. 8º, §5º: concede ou revoga consentimentos específicos
  async updateConsents(consents: {
    consent_health_data?: boolean
    consent_ai_mentor?: boolean
  }): Promise<{ consent_health_data: boolean; consent_ai_mentor: boolean }> {
    const response = await httpClient.patch('/hunters/consents', consents)
    return response.data
  },

  // LGPD art. 18: portabilidade dos dados do titular
  async exportData(): Promise<Record<string, unknown>> {
    const response = await httpClient.get<Record<string, unknown>>('/hunters/data-export')
    return response.data
  },

  // LGPD art. 18, VI: anonimização e eliminação
  async deleteAccount(): Promise<void> {
    await httpClient.delete('/hunters/account')
  },

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
