import { httpClient } from './client'

export interface GenerateDailyReport {
  processed: number
  created: number
  skipped: number
}

export interface CreateIndividualMissionRequest {
  userId: string
  name: string
  category: string
  difficulty: string
  xp: number
  icon?: string
}

export interface AdminMission {
  id: string
  name: string
  category: string
  difficulty: string
  xp: number
  icon: string
  done: boolean
  daily: boolean
}

const adminApi = {
  /** Dispara manualmente o job diário: gera missões via IA para todo hunter sem missões hoje. */
  async generateDailyMissionsForAll(): Promise<GenerateDailyReport> {
    const response = await httpClient.post<GenerateDailyReport>('/missions/generate-daily/all')
    return response.data
  },

  /** Cria uma missão totalmente manual para um hunter específico. */
  async createIndividualMission(data: CreateIndividualMissionRequest): Promise<AdminMission> {
    const { userId, ...body } = data
    const response = await httpClient.post<AdminMission>(`/missions/${userId}/individual`, body)
    return response.data
  },
}

export default adminApi
