import { httpClient } from './client'

export interface BodyMeasurement {
  id: string
  user_id: string
  weight_kg: number | null
  height_cm: number | null
  body_fat_pct: number | null
  measured_at: string
  created_at: string
}

export interface LogMeasurementRequest {
  weight_kg?: number
  height_cm?: number
  body_fat_pct?: number
}

const measurementsApi = {
  async log(data: LogMeasurementRequest): Promise<BodyMeasurement> {
    const response = await httpClient.post<BodyMeasurement>('/hunters/measurements', data)
    return response.data
  },

  async getHistory(page: number = 1, limit: number = 20): Promise<{
    measurements: BodyMeasurement[]
    total: number
  }> {
    const response = await httpClient.get<{ measurements: BodyMeasurement[]; total: number }>(
      '/hunters/measurements',
      { params: { page, limit } },
    )
    return response.data
  },
}

export default measurementsApi
