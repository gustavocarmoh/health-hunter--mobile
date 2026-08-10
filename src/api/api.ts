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
        name: userRes.name,
        xp: userXp,
        level,
        rank: ['E', 'D', 'C', 'B', 'A', 'S', 'SS'].includes(rank) ? rank : 'E',
        xpToNext,
        xpInCurrentLevel,
        streak: 0,
        totalMissions: 0,
        achievementsCount: 0,
        statPointsAvailable: userRes.stat_points_available || 0,
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
        name: 'Sem Guilda',
        tag: '-',
        level: 0,
        globalRank: 0,
        totalXp: 0,
        weeklyContribution: 0,
      }
      let guildMembers: GuildMember[] = []
      try {
        const myGuild = await guildsApi.getMyGuild()
        console.log('🏰 Bootstrap: myGuild data:', myGuild)

        if (myGuild && myGuild.id) {
          const guildData = myGuild as any
          guild = {
            name: guildData.name,
            tag: guildData.tag,
            level: guildData.rank ? 1 : 1, // Backend returns 'rank' not 'level'
            globalRank: guildData.global_rank || 0,
            totalXp: guildData.xp || 0,
            weeklyContribution: 0,
          }
          console.log('🏰 Bootstrap: Guild loaded:', guild)

          const members = await guildsApi.getMembers()
          guildMembers = members.map((m: any) => ({
            name: m.name,
            role: m.role,
            xp: m.xp,
            isMe: false,
            avatarColor: '#7C3AED',
          }))
        }
      } catch (err) {
        console.error('🏰 Bootstrap: Error loading guild:', err)
        // User has no guild yet - keep default "Sem Guilda"
      }

      // Fetch browse guilds
      let browseGuilds: BrowseGuild[] = []
      try {
        const browseGuildsRes = await guildsApi.browse(1, 20)
        browseGuilds = browseGuildsRes.guilds.map((g: any, i: number) => ({
          id: g.id,
          name: g.name,
          tag: g.tag,
          level: g.level,
          memberCount: g.member_count || 0,
          color: ['#7C3AED', '#EC4899', '#F59E0B', '#10B981'][i % 4],
        }))
      } catch (err) {
        console.error('Error fetching browse guilds:', err)
        browseGuilds = []
      }

      // Fetch challenges
      let challenges: ChallengeItem[] = []
      try {
        const challengesRes = await challengesApi.getAll()
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
        events = eventsRes.map((e: any, i: number) => ({
          id: i,
          name: e.title,
          desc: e.description,
          dateLabel: new Date(e.start_date).toLocaleDateString(),
          participants: e.participants || 0,
          joined: e.joined || false,
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
          pos: e.position,
          name: e.name,
          rank: e.rank_level as any,
          xp: e.xp,
          level: 1,
          title: e.title || '',
          missions: 0,
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
        }))
        console.log('✅ Missions loaded:', missions.length)
      } catch (err: any) {
        console.error('Error fetching missions:', err.message)
        missions = []
      }

      // Fetch streak history (if available from profile or API)
      const streakHistoryRaw: number[] = []
      for (let i = 0; i < 30; i++) {
        streakHistoryRaw.push(Math.random() > 0.7 ? 1 : 0)
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

  async joinGuild(guild: BrowseGuild, me: { name: string; xp: number }): Promise<{ guild: Guild; guildMembers: GuildMember[] }> {
    const guildRes = await guildsApi.join(guild.name)
    const membersRes = await guildsApi.getMembers()
    return {
      guild: {
        name: guildRes.name,
        tag: guildRes.tag,
        level: guildRes.level,
        globalRank: guildRes.global_rank,
        totalXp: guildRes.total_xp,
        weeklyContribution: guildRes.weekly_contribution,
      },
      guildMembers: membersRes.map((m: any) => ({
        name: m.name,
        role: m.role,
        xp: m.xp,
        isMe: m.name === me.name,
        avatarColor: '#7C3AED',
      })),
    }
  },
}
