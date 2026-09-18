import { Category, Difficulty, GuildRole, PlayerStatKey, Rank, Rarity, RankingScope, SortBy, ToastKind } from './stateConfig';

export type { Category, Difficulty, GuildRole, PlayerStatKey, Rank, Rarity, RankingScope, SortBy, ToastKind };

export type MissionValidationType = 'TRUSTED' | 'GPS_DISTANCE' | 'DURATION' | 'HYDRATION';

export interface Mission {
  id: string;
  name: string;
  category: Category;
  difficulty: Difficulty;
  xp: number;
  icon: string;
  done: boolean;
  daily: boolean;
  /** 'TRUSTED' = toggle livre (honor system). 'GPS_DISTANCE'/'DURATION' só concluem via
   * "Iniciar Atividade", validado pelo backend com uma atividade rastreada de verdade.
   * 'HYDRATION' conclui sozinha quando a soma dos registros de água bate a meta. */
  validation_type: MissionValidationType;
  target_distance_m: number | null;
  target_duration_sec: number | null;
  target_amount_ml: number | null;
  current_amount_ml: number;
}

export type AchievementConditionType = 'ACTIVITIES_COUNT' | 'DISTANCE_KM' | 'RANK_REACHED';

export interface Achievement {
  id: number;
  name: string;
  desc: string;
  rarity: Rarity;
  xp: number;
  unlocked: boolean;
  icon: string;
  unlockAt?: number;
  conditionType: AchievementConditionType;
  currentValue: number;
  targetValue: number;
  progressPct: number;
}

export interface RankingEntry {
  hunter_id: string;
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
  userId: string;
  name: string;
  role: GuildRole;
  xp: number;
  isMe?: boolean;
  avatarColor: string;
}

export interface Guild {
  id: string;
  name: string;
  tag: string;
  level: number;
  globalRank: number;
  totalXp: number;
  weeklyContribution: number;
  myRole: GuildRole;
  contributionRank: number | null;
}

export interface BrowseGuild {
  id: string;
  name: string;
  tag: string;
  level: number;
  memberCount: number;
  color: string;
  position: number;
  xp: number;
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
  id: string;
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
  /** 'ADMIN' | 'USER' — vindo de /auth/me. Controla a visibilidade do painel admin. */
  role: string;
}

export interface OnboardingStepData {
  icon: string;
  title: string;
  desc: string;
}
