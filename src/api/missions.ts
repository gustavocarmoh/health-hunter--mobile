import { httpClient } from './client'

export interface HydrationMissionResponse {
  id: string
  done: boolean
  current_amount_ml: number
  target_amount_ml: number | null
  xp: number
}

const missionsApi = {
  /**
   * Conclui uma missão GPS_DISTANCE/DURATION vinculando-a a uma atividade real já registrada
   * (rastreada pelo app). O backend valida se a atividade atinge a meta da missão.
   */
  async completeWithActivity(missionId: string, activityId: string): Promise<void> {
    await httpClient.post(`/missions/${missionId}/complete-with-activity`, {
      activity_id: activityId,
    })
  },

  /**
   * Registra mL bebidos numa missão HYDRATION. O backend soma ao total do dia e conclui a
   * missão sozinho quando a meta é atingida.
   */
  async addHydration(missionId: string, amountMl: number): Promise<HydrationMissionResponse> {
    const response = await httpClient.post<HydrationMissionResponse>(
      `/missions/${missionId}/hydrate`,
      { amount_ml: amountMl },
    )
    return response.data
  },
}

export default missionsApi
