import authApi from './auth'
import activitiesApi from './activities'
import challengesApi from './challenges'
import eventsApi from './events'
import guildsApi from './guilds'
import leaderboardsApi from './leaderboards'
import friendsApi from './friends'
import huntersApi from './hunters'
import achievementsApi from './achievements'
import { httpClient } from './client'
import {
  Achievement,
  BrowseGuild,
  ChallengeItem,
  Difficulty,
  EventItem,
  FeedItemData,
  Guild,
  GuildMember,
  Mission,
  RankingEntry,
  UserState,
} from '../state/types'
import { CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '../state/stateConfig'

// Calculate level and xpToNext from total XP
export function calculateLevelFromXp(totalXp: number): { level: number; xpToNext: number; xpInCurrentLevel: number; xpNeededForNextLevel: number } {
  let level = 1
  let xpNeededForNextLevel = 900
  let xpSpent = 0

  // Each level requires increasingly more XP
  while (xpSpent + xpNeededForNextLevel <= totalXp) {
    xpSpent += xpNeededForNextLevel
    level++
    xpNeededForNextLevel = Math.floor(900 + (level - 1) * 300) // Scale: 900, 1200, 1500, 1800...
  }

  // Calculate XP within current level (for progress bar display)
  const xpInCurrentLevel = totalXp - xpSpent
  // xpToNext should be the XP needed for CURRENT level (not total)
  // So progress bar = xpInCurrentLevel / xpToNext * 100%
  const xpToNext = xpNeededForNextLevel

  return { level, xpToNext, xpInCurrentLevel, xpNeededForNextLevel }
}

export interface BootstrapData {
  user: UserState
  missions: Mission[]
  achievements: Achievement[]
  ranking: RankingEntry[]
  guild: Guild
  guildMembers: GuildMember[]
  guildQuestProgress: number
  browseGuilds: BrowseGuild[]
  events: EventItem[]
  challenges: ChallengeItem[]
  feedItems: FeedItemData[]
  streakHistoryRaw: number[]
  streakFreezes: number
  streakProtected: boolean
}

export const api = {
  async fetchBootstrap(): Promise<BootstrapData> {
    try {
      // Fetch user data
      const userRes = await authApi.getMe()
      const rank = (userRes.rank_level || 'E') as any
      const userXp = userRes.xp || 0
      const { level, xpToNext, xpInCurrentLevel } = calculateLevelFromXp(userXp)

      const user: UserState = {
        id: userRes.id,
        name: userRes.name,
        xp: userXp,
        level,
        rank: ['E', 'D', 'C', 'B', 'A', 'S', 'SS'].includes(rank) ? rank : 'E',
        xpToNext,
        xpInCurrentLevel,
        // streak/totalMissions/achievementsCount são preenchidos com dados reais mais abaixo,
        // depois que missions/achievements/streaks forem buscados.
        streak: 0,
        totalMissions: 0,
        achievementsCount: 0,
        statPointsAvailable: userRes.stat_points_available || 0,
        role: userRes.role || 'USER',
        stats: {
          strength: userRes.strength || 0,
          intel: userRes.intel || 0,
          vitality: userRes.vitality || 0,
          sense: userRes.sense || 0,
          agility: userRes.agility || 0,
        },
      }

      // Fetch guilds (browse + my)
      let guild: Guild = {
        id: '',
        name: 'Sem Guilda',
        tag: '-',
        level: 0,
        globalRank: 0,
        totalXp: 0,
        weeklyContribution: 0,
        myRole: 'MEMBER',
        contributionRank: null,
      }
      let guildMembers: GuildMember[] = []
      try {
        const { guild: guildData, membership } = await guildsApi.getMyGuild()

        if (guildData && membership) {
          guild = {
            id: guildData.id,
            name: guildData.name,
            tag: guildData.tag,
            level: 1,
            globalRank: guildData.global_rank || 0,
            totalXp: guildData.xp || 0,
            weeklyContribution: membership.contribution_xp || 0,
            myRole: membership.role,
            contributionRank: membership.contribution_rank,
          }

          const members = await guildsApi.getMembers()
          guildMembers = members.map((m) => ({
            userId: m.user_id,
            name: m.name,
            role: m.role,
            xp: m.xp,
            isMe: m.user_id === userRes.id,
            avatarColor: '#7C3AED',
          }))
        }
      } catch (err) {
        console.error('🏰 Bootstrap: Error loading guild:', err)
        // User has no guild yet - keep default "Sem Guilda"
      }

      // Fetch browse guilds — GET /guilds já vem ordenado por xp DESC, é o ranking global.
      let browseGuilds: BrowseGuild[] = []
      try {
        const browseGuildsRes = await guildsApi.browse(1, 20)
        browseGuilds = browseGuildsRes.guilds.map((g, i) => ({
          id: g.id,
          name: g.name,
          tag: g.tag,
          level: 1,
          memberCount: g.memberCount,
          color: ['#7C3AED', '#EC4899', '#F59E0B', '#10B981'][i % 4],
          position: g.position,
          xp: g.xp,
        }))
      } catch (err) {
        console.error('Error fetching browse guilds:', err)
        browseGuilds = []
      }

      // Fetch challenges
      let challenges: ChallengeItem[] = []
      try {
        const challengesRes = await challengesApi.getAvailable()
        challenges = challengesRes.map((c: any, i: number) => ({
          id: i,
          name: c.title,
          goal: c.description,
          xp: c.xp_reward || 0,
          progress: 0,
          target: 100,
          joined: c.joined || false,
        }))
      } catch (err) {
        console.error('Error fetching challenges:', err)
        challenges = []
      }

      // Fetch events
      let events: EventItem[] = []
      try {
        const eventsRes = await eventsApi.getAll()
        events = eventsRes.map((e, i) => ({
          id: i,
          name: e.title,
          desc: e.description,
          dateLabel: new Date(e.ends_at).toLocaleDateString(),
          participants: e.participant_count,
          joined: e.joined,
        }))
      } catch (err) {
        console.error('Error fetching events:', err)
        events = []
      }

      // Fetch leaderboard
      let ranking: RankingEntry[] = []
      try {
        const leaderboardRes = await leaderboardsApi.getGlobal(1, 50)
        ranking = leaderboardRes.leaderboard.map((e: any) => ({
          hunter_id: e.hunter_id,
          pos: e.position,
          name: e.name,
          rank: e.rank_level as any,
          xp: e.xp,
          // Level é determinístico a partir do XP — dá pra calcular pra qualquer hunter,
          // não só o usuário logado.
          level: calculateLevelFromXp(e.xp || 0).level,
          title: e.title || '',
          missions: e.missions_completed || 0,
          // Streak por hunter alheio não é exposto pelo backend (caro de calcular em lote
          // pro ranking inteiro) — só o streak do próprio usuário é real, os demais ficam 0.
          streak: 0,
        }))
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
        ranking = []
      }

      // Fetch achievements
      let achievements: Achievement[] = []
      try {
        achievements = await achievementsApi.getMyAchievements()
      } catch {
        achievements = []
      }

      // Fetch missions for today
      let missions: Mission[] = []
      try {
        const missionsRes = await httpClient.get<any>('/missions')
        console.log('📋 Missions response:', missionsRes.data)

        const missionsData = Array.isArray(missionsRes.data) ? missionsRes.data : (missionsRes.data?.missions || [])
        missions = missionsData.map((m: any) => ({
          id: m.id || Math.random().toString(),
          name: m.title || m.name || 'Sem nome',
          category: m.category || 'CUSTOM',
          difficulty: m.difficulty || 'EASY',
          xp: m.xp_reward || m.xp || 0,
          icon: m.icon || '🎯',
          done: m.done ?? false,
          daily: m.daily ?? true,
          validation_type: m.validation_type || 'TRUSTED',
          target_distance_m: m.target_distance_m ?? null,
          target_duration_sec: m.target_duration_sec ?? null,
          target_amount_ml: m.target_amount_ml ?? null,
          current_amount_ml: m.current_amount_ml ?? 0,
        }))
        console.log('✅ Missions loaded:', missions.length)
      } catch (err: any) {
        console.error('Error fetching missions:', err.message)
        missions = []
      }

      // Streak real vem de /activities/streaks — não existe em /activities/summary.
      try {
        const streaks = await activitiesApi.getStreaks()
        user.streak = streaks.current_streak
      } catch (err) {
        console.error('Error fetching streaks:', err)
      }

      // Contador de missões concluídas e de conquistas desbloqueadas — antes ficavam sempre 0.
      user.totalMissions = missions.filter((m) => m.done).length
      user.achievementsCount = achievements.filter((a) => a.unlocked).length

      // Histórico de streak: os últimos 7 dias vêm de dados reais (/activities/weekly-summary);
      // o resto do mês fica com 0 (não temos histórico diário além disso), em vez de números
      // aleatórios fingindo ser dado real.
      const streakHistoryRaw: number[] = new Array(23).fill(0)
      try {
        const weekly = await activitiesApi.getWeeklySummary()
        streakHistoryRaw.push(...weekly.days.map((d) => (d.count > 0 ? 1 : 0)))
      } catch (err) {
        console.error('Error fetching weekly summary:', err)
        streakHistoryRaw.push(...new Array(7).fill(0))
      }

      return {
        user,
        missions,
        achievements,
        ranking,
        guild: guild || null,
        guildMembers,
        guildQuestProgress: 0,
        browseGuilds,
        events,
        challenges,
        feedItems: [],
        streakHistoryRaw,
        streakFreezes: 2,
        streakProtected: false,
      }
    } catch (error) {
      console.error('Bootstrap failed:', error)
      throw error
    }
  },

  async createMission(input: { name: string; category: Mission['category']; difficulty: Difficulty }): Promise<Mission> {
    return {
      id: Date.now().toString(),
      name: input.name.trim(),
      category: input.category,
      difficulty: input.difficulty,
      xp: DIFFICULTY_CONFIG[input.difficulty].xp,
      icon: CATEGORY_CONFIG[input.category]?.icon || '🎯',
      done: false,
      daily: false,
      validation_type: 'TRUSTED',
      target_distance_m: null,
      target_duration_sec: null,
      target_amount_ml: null,
      current_amount_ml: 0,
    }
  },

  async generateDailyMissions(): Promise<Mission[]> {
    try {
      const res = await httpClient.post<any[]>('/missions/generate-daily')
      return res.data
    } catch (err: any) {
      if (err.response?.status !== 409) {
        console.error('Error generating daily missions:', err)
      }
      throw err
    }
  },

  async updateMissionDone(id: number | string, done: boolean): Promise<void> {
    try {
      await httpClient.patch(`/missions/${id}/done`, { done })
    } catch (err: any) {
      console.error('Error updating mission:', err.message)
      throw err
    }
  },

  async updateEventJoined(_id: number, _joined: boolean): Promise<void> {
    return
  },

  async updateChallengeJoined(_id: number, _joined: boolean): Promise<void> {
    return
  },

  // Guild APIs
  guilds: guildsApi,

  // Friends APIs
  friends: friendsApi,

  // Auth APIs
  auth: authApi,

  // Activities APIs
  activities: activitiesApi,

  // Challenges APIs
  challenges: challengesApi,

  // Events APIs
  events: eventsApi,

  // Leaderboards APIs
  leaderboards: leaderboardsApi,

  // Hunters APIs
  hunters: huntersApi,

  async joinGuild(guild: BrowseGuild, me: { id: string }): Promise<{ guild: Guild; guildMembers: GuildMember[] }> {
    await guildsApi.join(guild.id)
    const [{ guild: guildData, membership }, membersRes] = await Promise.all([
      guildsApi.getMyGuild(),
      guildsApi.getMembers(),
    ])
    if (!guildData || !membership) {
      throw new Error('Falha ao carregar a guilda após entrar.')
    }
    return {
      guild: {
        id: guildData.id,
        name: guildData.name,
        tag: guildData.tag,
        level: 1,
        globalRank: guildData.global_rank || 0,
        totalXp: guildData.xp || 0,
        weeklyContribution: membership.contribution_xp || 0,
        myRole: membership.role,
        contributionRank: membership.contribution_rank,
      },
      guildMembers: membersRes.map((m) => ({
        userId: m.user_id,
        name: m.name,
        role: m.role,
        xp: m.xp,
        isMe: m.user_id === me.id,
        avatarColor: '#7C3AED',
      })),
    }
  },
}
