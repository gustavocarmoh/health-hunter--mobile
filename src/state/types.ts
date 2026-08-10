import { Category, Difficulty, GuildRole, PlayerStatKey, Rank, Rarity, RankingScope, SortBy, ToastKind } from './stateConfig';

export type { Category, Difficulty, GuildRole, PlayerStatKey, Rank, Rarity, RankingScope, SortBy, ToastKind };

export interface Mission {
  id: string;
  name: string;
  category: Category;
  difficulty: Difficulty;
  xp: number;
  icon: string;
  done: boolean;
  daily: boolean;
}

export interface Achievement {
  id: number;
  name: string;
  desc: string;
  rarity: Rarity;
  xp: number;
  unlocked: boolean;
  icon: string;
  unlockAt?: number;
}

export interface RankingEntry {
  pos: number;
  name: string;
  level: number;
  rank: Rank;
  xp: number;
  title: string;
  missions: number;
  streak: number;
}

export interface GuildMember {
  name: string;
  role: GuildRole;
  xp: number;
  isMe?: boolean;
  avatarColor: string;
}

export interface Guild {
  name: string;
  tag: string;
  level: number;
  globalRank: number;
  totalXp: number;
  weeklyContribution: number;
}

export interface BrowseGuild {
  id: string;
  name: string;
  tag: string;
  level: number;
  memberCount: number;
  color: string;
}

export interface EventItem {
  id: number;
  name: string;
  desc: string;
  dateLabel: string;
  participants: number;
  joined: boolean;
}

export interface ChallengeItem {
  id: number;
  name: string;
  goal: string;
  progress: number;
  target: number;
  xp: number;
  joined: boolean;
}

export interface FeedItemData {
  name: string;
  initial: string;
  avatarColor: string;
  action: string;
  time: string;
  hasXp: boolean;
  xp?: number;
}

export interface UserState {
  name: string;
  level: number;
  rank: Rank;
  xp: number;
  xpToNext: number;
  xpInCurrentLevel: number;
  streak: number;
  totalMissions: number;
  achievementsCount: number;
  stats: Record<PlayerStatKey, number>;
  statPointsAvailable: number;
}

export interface OnboardingStepData {
  icon: string;
  title: string;
  desc: string;
}
