import { httpClient } from './client'

export type GuildRole = 'MASTER' | 'VICE_MASTER' | 'ELITE' | 'MEMBER'

export interface Guild {
  id: string
  name: string
  tag: string
  description: string | null
  emblem: string
  master_id: string
  rank: string
  xp: number
  global_rank: number
  member_count: number
  is_public: boolean
}

export interface GuildMembership {
  id: string
  guild_id: string
  user_id: string
  role: GuildRole
  contribution_xp: number
  contribution_rank: number | null
}

export interface GuildMember {
  user_id: string
  name: string
  role: GuildRole
  xp: number
  joined_at?: string
}

export interface GuildListItem {
  id: string
  name: string
  tag: string
  emblem: string
  rank: string
  xp: number
  position: number
  memberCount: number
}

export interface GuildLeaderboardEntry {
  position: number
  user_id: string
  name: string
  rank_level: string
  role: GuildRole
  contribution_xp: number
}

export interface GuildMonster {
  id: string
  name: string
  icon: string
  max_hp: number
  current_hp: number
  is_defeated: boolean
}

export interface GuildInvite {
  invite_id: string
  guild: { id: string; name: string; tag: string; emblem: string } | null
  invited_by_id: string
  expires_at: string
  created_at: string
}

const guildsApi = {
  /** Backend retorna { guild, membership } — guild vem com global_rank/member_count,
   * membership vem com contribution_rank (posição do hunter no ranking interno da guilda). */
  async getMyGuild(): Promise<{ guild: Guild | null; membership: GuildMembership | null }> {
    const response = await httpClient.get<{ guild: Guild | null; membership: GuildMembership | null }>(
      '/guilds/my',
    )
    return response.data
  },

  async getMembers(): Promise<GuildMember[]> {
    const response = await httpClient.get<GuildMember[]>('/guilds/my/members')
    return response.data
  },

  /** Monstro coletivo da guilda — dano é automático (XP de atividades/missões de qualquer
   * membro), não existe ataque manual. Spawna um novo sozinho quando o anterior é derrotado. */
  async getMonster(): Promise<GuildMonster> {
    const response = await httpClient.get<GuildMonster>('/guilds/my/monster')
    return response.data
  },

  /** GET /guilds já vem ordenado por xp DESC com `position` explícito — é o ranking global
   * de guildas (não só uma lista de busca). */
  async browse(page: number = 1, limit: number = 20, search?: string): Promise<{ guilds: GuildListItem[]; total: number }> {
    const response = await httpClient.get<{ guilds: GuildListItem[]; total: number }>('/guilds', {
      params: { page, limit, search },
    })
    return { guilds: response.data.guilds || [], total: response.data.total || 0 }
  },

  async getGuildLeaderboard(guildId: string, limit: number = 20): Promise<GuildLeaderboardEntry[]> {
    const response = await httpClient.get<{ leaderboard: GuildLeaderboardEntry[] }>(
      `/guilds/${guildId}/leaderboard`,
      { params: { limit } },
    )
    return response.data.leaderboard
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

  async invite(guildId: string, userId: string): Promise<void> {
    await httpClient.post(`/guilds/${guildId}/invite`, { user_id: userId })
  },

  async kick(guildId: string, userId: string): Promise<void> {
    await httpClient.delete(`/guilds/${guildId}/kick/${userId}`)
  },

  /** MASTER-only. Não aceita 'MASTER' como novo papel — pra isso existe transferência
   * de liderança, que não foi pedida ainda pelo produto. */
  async promote(guildId: string, userId: string, role: Exclude<GuildRole, 'MASTER'>): Promise<void> {
    await httpClient.patch(`/guilds/${guildId}/members/${userId}/role`, { role })
  },

  async getInvites(): Promise<GuildInvite[]> {
    const response = await httpClient.get<GuildInvite[]>('/guilds/invites')
    return response.data
  },

  async respondToInvite(inviteId: string, accept: boolean): Promise<void> {
    await httpClient.post(`/guilds/invites/${inviteId}/respond`, { accept })
  },
}

export default guildsApi
