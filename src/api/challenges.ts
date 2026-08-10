import { httpClient } from './client'

export interface Challenge {
  id: string
  title: string
  description: string
  goal: string
  target: number
  progress: number
  xp_reward: number
  joined: boolean
  completed: boolean
  deadline?: string
}

const challengesApi = {
  async getAll(): Promise<Challenge[]> {
    const response = await httpClient.get<Challenge[]>('/challenges')
    return response.data
  },

  async getById(id: string): Promise<Challenge> {
    const response = await httpClient.get<Challenge>(`/challenges/${id}`)
    return response.data
  },

  async join(id: string): Promise<Challenge> {
    const response = await httpClient.post<Challenge>(`/challenges/${id}/join`, {})
    return response.data
  },

  async leave(id: string): Promise<void> {
    await httpClient.post(`/challenges/${id}/leave`, {})
  },

  async updateProgress(id: string, progress: number): Promise<Challenge> {
    const response = await httpClient.patch<Challenge>(`/challenges/${id}`, { progress })
    return response.data
  },
}

export default challengesApi
