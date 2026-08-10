import { httpClient } from './client'

export interface Event {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  participants: number
  joined: boolean
  status: 'active' | 'closed' | 'cancelled'
  xp_reward?: number
}

export interface EventParticipant {
  hunter_id: string
  name: string
  rank: string
  xp_earned: number
}

const eventsApi = {
  async getAll(): Promise<Event[]> {
    const response = await httpClient.get<Event[]>('/events/active')
    return response.data
  },

  async getById(id: string): Promise<Event> {
    const response = await httpClient.get<Event>(`/events/${id}`)
    return response.data
  },

  async getParticipants(id: string): Promise<EventParticipant[]> {
    const response = await httpClient.get<EventParticipant[]>(`/events/${id}/participants`)
    return response.data
  },

  async join(id: string): Promise<Event> {
    const response = await httpClient.post<Event>(`/events/${id}/join`, {})
    return response.data
  },

  async leave(id: string): Promise<void> {
    await httpClient.post(`/events/${id}/leave`, {})
  },
}

export default eventsApi
