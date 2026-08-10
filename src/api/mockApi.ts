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
} from '../state/types';
import {
  INITIAL_ACHIEVEMENTS,
  INITIAL_BROWSE_GUILDS,
  INITIAL_CHALLENGES,
  INITIAL_EVENTS,
  INITIAL_FEED,
  INITIAL_GUILD,
  INITIAL_GUILD_MEMBERS,
  INITIAL_MISSIONS,
  INITIAL_RANKING,
  INITIAL_STREAK_HISTORY_RAW,
  INITIAL_USER,
} from '../state/data';
import { CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '../state/stateConfig';

/**
 * Mock implementation of the future backend API. Every function returns a Promise
 * and takes the same shape of input/output a real endpoint would, so call sites in
 * AppStateContext already look and behave like real network calls. Swapping the body
 * of a function for a `fetch(...)` (or throwing on a bad response) is the only change
 * needed once a real backend exists — nothing above this layer should need to change.
 */

export interface BootstrapData {
  user: UserState;
  missions: Mission[];
  achievements: Achievement[];
  ranking: RankingEntry[];
  guild: Guild;
  guildMembers: GuildMember[];
  guildQuestProgress: number;
  browseGuilds: BrowseGuild[];
  events: EventItem[];
  challenges: ChallengeItem[];
  feedItems: FeedItemData[];
  streakHistoryRaw: number[];
  streakFreezes: number;
  streakProtected: boolean;
}

function resolveAfter<T>(value: T, ms = 0): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const api = {
  /** Everything the app needs to render on launch — a real backend would serve this as one "GET /bootstrap" call. */
  fetchBootstrap(): Promise<BootstrapData> {
    return resolveAfter({
      user: INITIAL_USER,
      missions: INITIAL_MISSIONS,
      achievements: INITIAL_ACHIEVEMENTS,
      ranking: INITIAL_RANKING,
      guild: INITIAL_GUILD,
      guildMembers: INITIAL_GUILD_MEMBERS,
      guildQuestProgress: 62,
      browseGuilds: INITIAL_BROWSE_GUILDS,
      events: INITIAL_EVENTS,
      challenges: INITIAL_CHALLENGES,
      feedItems: INITIAL_FEED,
      streakHistoryRaw: INITIAL_STREAK_HISTORY_RAW,
      streakFreezes: 2,
      streakProtected: false,
    });
  },

  createMission(input: { name: string; category: Mission['category']; difficulty: Difficulty }): Promise<Mission> {
    return resolveAfter({
      id: Date.now(),
      name: input.name.trim(),
      category: input.category,
      difficulty: input.difficulty,
      xp: DIFFICULTY_CONFIG[input.difficulty].xp,
      icon: CATEGORY_CONFIG[input.category].icon,
      done: false,
      daily: false,
    });
  },

  generateDailyMissions(): Promise<Mission[]> {
    return resolveAfter([]);
  },

  updateMissionDone(_id: number, _done: boolean): Promise<void> {
    return resolveAfter(undefined);
  },

  updateEventJoined(_id: number, _joined: boolean): Promise<void> {
    return resolveAfter(undefined);
  },

  updateChallengeJoined(_id: number, _joined: boolean): Promise<void> {
    return resolveAfter(undefined);
  },

  joinGuild(guild: BrowseGuild, me: { name: string; xp: number }): Promise<{ guild: Guild; guildMembers: GuildMember[] }> {
    return resolveAfter({
      guild: {
        name: guild.name,
        tag: guild.tag,
        level: guild.level,
        globalRank: Math.max(1, 20 - guild.level),
        totalXp: guild.level * 20000,
        weeklyContribution: 0,
      },
      guildMembers: [{ name: me.name, role: 'MEMBER' as const, xp: me.xp, isMe: true, avatarColor: '#7C3AED' }],
    });
  },
};
