import { httpClient } from './client'

export interface Challenge {
  id: string
  title: string
  description: string
  tipo_exercicio: string
  xp_base: number
  coins_base: number
  min_rank_required: string
  is_active: boolean
  target_count: number
}

export type ChallengeParticipationStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED'

export interface ChallengeParticipation {
  id: string
  challenge_id: string
  user_id: string
  status: ChallengeParticipationStatus
  progress: number
  joined_at: string
  completed_at: string | null
  challenge: Challenge | null
}

const challengesApi = {
  /** Desafios disponíveis pro rank do hunter — não diz se ele já entrou ou não. */
  async getAvailable(): Promise<Challenge[]> {
    const response = await httpClient.get<Challenge[]>('/challenges')
    return response.data
  },

  /** Desafios em que o hunter já está inscrito (ACTIVE/COMPLETED/ABANDONED), com progresso real. */
  async getMine(): Promise<{ total: number; participations: ChallengeParticipation[] }> {
    const response = await httpClient.get<{ total: number; participations: ChallengeParticipation[] }>(
      '/challenges/my',
    )
    return response.data
  },

  async join(id: string): Promise<ChallengeParticipation> {
    const response = await httpClient.post<ChallengeParticipation>(`/challenges/${id}/join`, {})
    return response.data
  },

  /** Rota real é "abandon", não "leave" — o progresso é automático via missões, não há mais
   * conclusão manual pelo app (isso acontece sozinho ao bater a meta de missões). */
  async abandon(id: string): Promise<void> {
    await httpClient.patch(`/challenges/${id}/abandon`, {})
  },
}

export default challengesApi
