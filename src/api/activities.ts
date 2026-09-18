import { httpClient } from './client'

/** Retorno de POST /activities/log — NÃO tem "id", tem "activity_id". */
export interface LogActivityResponse {
  activity_id: string
  xp_gained: number
  coins_gained: number
  total_xp: number
  total_coins: number
}

/** Formato de uma linha de activity_logs, como devolvido por GET /activities/history. */
export interface Activity {
  id: string
  user_id: string
  distancia_m: number
  duracao_seg: number
  tipo_exercicio: string
  bpm_medio: number | null
  xp_gained: number
  coins_gained: number
  source: 'TRACKED' | 'MANUAL'
  logged_at: string
}

export interface ActivitySummary {
  total_activities: number
  total_xp_today: number
  total_xp_this_week: number
  streak: number
}

export interface StreakInfo {
  hunter_id: string
  current_streak: number
  best_streak: number
}

export interface WeeklySummaryDay {
  date: string
  count: number
  xp: number
  distance_km: number
}

export interface GpsCoordinatesDto {
  latitude: number
  longitude: number
  altitude?: number
}

export interface GpsRoutePointDto extends GpsCoordinatesDto {
  timestamp: number
}

export interface LogActivityRequest {
  distancia_m: number
  duracao_seg: number
  tipo_exercicio: string
  coordenadas_gps: GpsCoordinatesDto
  bpm_medio: number
  /** 'TRACKED' = veio do fluxo "Iniciar Atividade" (GPS/cronômetro real); 'MANUAL' = digitado. */
  source?: 'TRACKED' | 'MANUAL'
  /** Percurso completo rastreado por GPS (corrida/caminhada/ciclismo) — o backend recalcula a
   * distância a partir dele. Omitido em atividades sem rastreamento contínuo (uma posição só). */
  route_gps?: GpsRoutePointDto[]
}

const activitiesApi = {
  async logActivity(data: LogActivityRequest): Promise<LogActivityResponse> {
    const response = await httpClient.post<LogActivityResponse>('/activities/log', data)
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

  /** Streak de verdade vem daqui, não de /activities/summary (que não tem esse campo). */
  async getStreaks(): Promise<StreakInfo> {
    const response = await httpClient.get<StreakInfo>('/activities/streaks')
    return response.data
  },

  async getWeeklySummary(): Promise<{ hunter_id: string; days: WeeklySummaryDay[] }> {
    const response = await httpClient.get<{ hunter_id: string; days: WeeklySummaryDay[] }>(
      '/activities/weekly-summary',
    )
    return response.data
  },
}

export default activitiesApi
