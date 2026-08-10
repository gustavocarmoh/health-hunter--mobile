import { httpClient } from './client'

export interface Guild {
  id: string
  name: string
  tag: string
  level: number
  global_rank: number
  total_xp: number
  weekly_contribution: number
  member_count: number
  owner_id: string
}

export interface GuildMember {
  user_id: string
  name: string
  role: 'OWNER' | 'OFFICER' | 'MEMBER'
  rank: string
  xp: number
  joined_at: string
}

export interface BrowseGuild {
  id: string
  name: string
  tag: string
  level: number
  member_count: number
  color: string
  description?: string
}

export interface GuildInvite {
  id: string
  guild_id: string
  guild_name: string
  from_user_id: string
  from_user_name: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  created_at: string
}

const guildsApi = {
  async getMyGuild(): Promise<Guild> {
    const response = await httpClient.get<any>('/guilds/my')
    console.log('📡 GET /guilds/my response:', response.data)
    // Backend returns { guild, membership }, extract guild
    return response.data.guild
  },

  async getMembers(): Promise<GuildMember[]> {
    const response = await httpClient.get<GuildMember[]>('/guilds/my/members')
    return response.data
  },

  async browse(page: number = 1, limit: number = 20, search?: string): Promise<{ guilds: BrowseGuild[]; total: number }> {
    const response = await httpClient.get<any>('/guilds', {
      params: { page, limit, search },
    })
    return {
      guilds: (response.data.guilds || response.data.data || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        tag: g.tag,
        level: g.level || 1,
        member_count: g.member_count || 0,
        color: '#7C3AED',
        description: g.description,
      })),
      total: response.data.total || 0,
    }
  },

  async join(guildId: string): Promise<Guild> {
    const response = await httpClient.post<Guild>(`/guilds/${guildId}/join`, {})
    return response.data
  },

  async leave(): Promise<void> {
    console.log('📡 DELETE /guilds/my/leave')
    try {
      await httpClient.delete('/guilds/my/leave')
      console.log('✅ Left guild successfully')
    } catch (err: any) {
      console.error('❌ Leave guild error:', err.message)
      throw err
    }
  },

  async create(data: { name: string; tag: string }): Promise<Guild> {
    console.log('📡 POST /guilds with:', data)
    try {
      const response = await httpClient.post<Guild>('/guilds', data)
      console.log('📡 POST /guilds response:', response.status, response.data)
      return response.data
    } catch (err: any) {
      console.error('📡 POST /guilds error:', err.message)
      console.error('📡 Response:', err.response?.status, err.response?.data)
      throw err
    }
  },

  async invite(userId: string): Promise<void> {
    await httpClient.post(`/guilds/my/invite`, { user_id: userId })
  },

  async kick(userId: string): Promise<void> {
    await httpClient.delete(`/guilds/my/members/${userId}`)
  },

  async getInvites(): Promise<GuildInvite[]> {
    const response = await httpClient.get<GuildInvite[]>('/guilds/invites')
    return response.data
  },

  async acceptInvite(guildId: string): Promise<Guild> {
    const response = await httpClient.post<Guild>(`/guilds/${guildId}/invites/accept`, {})
    return response.data
  },

  async rejectInvite(guildId: string): Promise<void> {
    await httpClient.delete(`/guilds/${guildId}/invites`)
  },
}

export default guildsApi
