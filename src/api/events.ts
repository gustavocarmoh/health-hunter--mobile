import { httpClient } from './client'

export interface EventMission {
  id: string
  name: string
  category: string
  xp: number
  icon: string
  done: boolean
}

export interface Event {
  id: string
  title: string
  description: string
  type: 'RAID' | 'CAMPAIGN'
  starts_at: string
  ends_at: string
  is_active: boolean
  participant_count: number
  joined: boolean
  mission_count: number
}

export interface EventDetail extends Event {
  missions: EventMission[]
}

export interface EventLeaderboardEntry {
  user_id: string
  xp_contributed: number
}

const eventsApi = {
  async getAll(): Promise<Event[]> {
    const response = await httpClient.get<Event[]>('/events/active')
    return response.data
  },

  async getById(id: string): Promise<EventDetail> {
    const response = await httpClient.get<EventDetail>(`/events/${id}`)
    return response.data
  },

  async getMine(): Promise<{ total: number; events: Event[] }> {
    const response = await httpClient.get<{ total: number; events: Event[] }>('/events/my')
    return response.data
  },

  async join(id: string): Promise<void> {
    await httpClient.post(`/events/${id}/join`, {})
  },

  async leave(id: string): Promise<void> {
    await httpClient.delete(`/events/${id}/leave`)
  },

  async getLeaderboard(id: string): Promise<{ event_id: string; event_title: string; leaderboard: EventLeaderboardEntry[] }> {
    const response = await httpClient.get<{ event_id: string; event_title: string; leaderboard: EventLeaderboardEntry[] }>(
      `/events/${id}/leaderboard`,
    )
    return response.data
  },
}

export default eventsApi
