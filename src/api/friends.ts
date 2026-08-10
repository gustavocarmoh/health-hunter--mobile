import { httpClient } from './client'

export interface Friend {
  id: string
  name: string
  rank: string
  xp: number
  status: 'online' | 'offline' | 'idle'
  avatar_url?: string
}

export interface FollowRequest {
  id: string
  from_user_id: string
  from_user_name: string
  created_at: string
}

const friendsApi = {
  async getFriends(page: number = 1, limit: number = 20): Promise<{ friends: Friend[]; total: number }> {
    const response = await httpClient.get<{ friends: Friend[]; total: number }>('/hunters/friends', {
      params: { page, limit },
    })
    return response.data
  },

  async getFollowing(page: number = 1, limit: number = 20): Promise<{ following: Friend[]; total: number }> {
    const response = await httpClient.get<{ following: Friend[]; total: number }>('/hunters/following', {
      params: { page, limit },
    })
    return response.data
  },

  async getFollowers(page: number = 1, limit: number = 20): Promise<{ followers: Friend[]; total: number }> {
    const response = await httpClient.get<{ followers: Friend[]; total: number }>('/hunters/followers', {
      params: { page, limit },
    })
    return response.data
  },

  async follow(userId: string): Promise<void> {
    await httpClient.post(`/hunters/${userId}/follow`, {})
  },

  async unfollow(userId: string): Promise<void> {
    await httpClient.delete(`/hunters/${userId}/follow`)
  },

  async getFollowRequests(): Promise<FollowRequest[]> {
    const response = await httpClient.get<FollowRequest[]>('/hunters/follow-requests')
    return response.data
  },

  async acceptFollowRequest(userId: string): Promise<void> {
    await httpClient.post(`/hunters/${userId}/follow-accept`, {})
  },

  async rejectFollowRequest(userId: string): Promise<void> {
    await httpClient.delete(`/hunters/${userId}/follow-requests`)
  },

  async searchHunters(query: string, limit: number = 20): Promise<{ results: Friend[]; total: number }> {
    const response = await httpClient.get<{ results: Friend[]; total: number }>('/hunters/search', {
      params: { q: query, limit },
    })
    return response.data
  },
}

export default friendsApi
