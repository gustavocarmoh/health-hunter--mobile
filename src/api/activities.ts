import { httpClient } from './client'

export interface Activity {
  id: string
  user_id: string
  type: string
  xp_gained: number
  logged_at: string
  description: string
}

export interface ActivitySummary {
  total_activities: number
  total_xp_today: number
  total_xp_this_week: number
  streak: number
}

export interface GpsCoordinatesDto {
  latitude: number
  longitude: number
  altitude?: number
}

export interface LogActivityRequest {
  distancia_m: number
  duracao_seg: number
  tipo_exercicio: string
  coordenadas_gps: GpsCoordinatesDto
  bpm_medio: number
}

const activitiesApi = {
  async logActivity(data: LogActivityRequest): Promise<Activity> {
    const response = await httpClient.post<Activity>('/activities/log', data)
    return response.data
  },

  async getHistory(page: number = 1, limit: number = 20): Promise<{
    activities: Activity[]
    total: number
  }> {
    const response = await httpClient.get<{ activities: Activity[]; total: number }>(
      '/activities/history',
      { params: { page, limit } },
    )
    return response.data
  },

  async getSummary(): Promise<ActivitySummary> {
    const response = await httpClient.get<ActivitySummary>('/activities/summary')
    return response.data
  },
}

export default activitiesApi
