/**
 * Single source of truth for every fixed vocabulary ("state") the app displays:
 * mission categories, difficulties, achievement rarities, hunter ranks, etc.
 *
 * Each config object below is the ONE place that lists the valid keys for its
 * concept, together with everything the UI derives from a key (label, color,
 * icon, xp...). Types and runtime arrays are derived FROM these objects
 * instead of being hand-typed a second time, so a backend integration only
 * has to update this file to add/rename a state — every screen that reads
 * from it stays in sync automatically.
 */

// ---------------------------------------------------------------------------
// Mission category
// ---------------------------------------------------------------------------
export const CATEGORY_CONFIG = {
  FITNESS: { label: 'Fitness', icon: '💪', color: '#EF4444' },
  STUDY: { label: 'Study', icon: '📚', color: '#3B82F6' },
  SLEEP: { label: 'Sleep', icon: '🌙', color: '#A78BFA' },
  MEDITATION: { label: 'Meditation', icon: '🧘', color: '#22C55E' },
  NUTRITION: { label: 'Nutrition', icon: '🥗', color: '#00F5FF' },
  CUSTOM: { label: 'Custom', icon: '✦', color: '#FBBF24' },
} as const;

export type Category = keyof typeof CATEGORY_CONFIG;
export const CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[];

/** "ALL" sentinel used only by the Missions filter row — not a real category. */
export const CATEGORY_FILTER_ALL = 'ALL' as const;
export type CategoryFilter = Category | typeof CATEGORY_FILTER_ALL;
export const CATEGORY_FILTERS: CategoryFilter[] = [CATEGORY_FILTER_ALL, ...CATEGORIES];

// ---------------------------------------------------------------------------
// Mission difficulty
// ---------------------------------------------------------------------------
export const DIFFICULTY_CONFIG = {
  EASY: { label: 'Easy', xp: 30, color: '#22C55E', bg: 'rgba(34,197,94,.15)' },
  MEDIUM: { label: 'Medium', xp: 60, color: '#FBBF24', bg: 'rgba(251,191,36,.15)' },
  HARD: { label: 'Hard', xp: 100, color: '#EF4444', bg: 'rgba(239,68,68,.15)' },
} as const;

export type Difficulty = keyof typeof DIFFICULTY_CONFIG;
export const DIFFICULTIES = Object.keys(DIFFICULTY_CONFIG) as Difficulty[];

// ---------------------------------------------------------------------------
// Achievement rarity
// ---------------------------------------------------------------------------
export const RARITY_CONFIG = {
  COMMON: { label: 'Common', color: '#9A9AC0', bg: 'rgba(154,154,192,.15)' },
  RARE: { label: 'Rare', color: '#3B82F6', bg: 'rgba(59,130,246,.15)' },
  EPIC: { label: 'Epic', color: '#A78BFA', bg: 'rgba(124,58,237,.18)' },
  LEGENDARY: { label: 'Legendary', color: '#FBBF24', bg: 'rgba(251,191,36,.15)' },
} as const;

export type Rarity = keyof typeof RARITY_CONFIG;
export const RARITIES = Object.keys(RARITY_CONFIG) as Rarity[];

// ---------------------------------------------------------------------------
// Hunter rank — ordered lowest (E) to highest (SS)
// ---------------------------------------------------------------------------
export const RANK_CONFIG = {
  E: { label: 'E', color: '#9A9AC0', bg: 'rgba(154,154,192,.15)', border: 'rgba(154,154,192,.4)' },
  D: { label: 'D', color: '#22C55E', bg: 'rgba(34,197,94,.15)', border: 'rgba(34,197,94,.4)' },
  C: { label: 'C', color: '#3B82F6', bg: 'rgba(59,130,246,.15)', border: 'rgba(59,130,246,.4)' },
  B: { label: 'B', color: '#FBBF24', bg: 'rgba(251,191,36,.15)', border: 'rgba(251,191,36,.4)' },
  A: { label: 'A', color: '#FB923C', bg: 'rgba(251,146,60,.15)', border: 'rgba(251,146,60,.4)' },
  S: { label: 'S', color: '#EF4444', bg: 'rgba(239,68,68,.15)', border: 'rgba(239,68,68,.4)' },
  SS: { label: 'SS', color: '#A78BFA', bg: 'rgba(124,58,237,.15)', border: 'rgba(124,58,237,.4)' },
} as const;

export type Rank = keyof typeof RANK_CONFIG;
/** Ordered E → SS — safe to use for "next rank" / progression logic. */
export const RANKS = Object.keys(RANK_CONFIG) as Rank[];

// ---------------------------------------------------------------------------
// Ranking screen: scope + sort
// ---------------------------------------------------------------------------
export const RANKING_SCOPE_CONFIG = {
  global: { label: 'GLOBAL' },
  friends: { label: 'AMIGOS' },
} as const;

export type RankingScope = keyof typeof RANKING_SCOPE_CONFIG;
export const RANKING_SCOPES = Object.keys(RANKING_SCOPE_CONFIG) as RankingScope[];

export const SORT_BY_CONFIG = {
  XP: { label: 'XP' },
  Level: { label: 'Level' },
  Missions: { label: 'Missions' },
  Streak: { label: 'Streak' },
} as const;

export type SortBy = keyof typeof SORT_BY_CONFIG;
export const SORT_BY_OPTIONS = Object.keys(SORT_BY_CONFIG) as SortBy[];

// ---------------------------------------------------------------------------
// Toast kind
// ---------------------------------------------------------------------------
export const TOAST_KIND_CONFIG = {
  xp: { color: '#FBBF24', emoji: '⚡ ' },
  info: { color: '#22C55E', emoji: '' },
  error: { color: '#EF4444', emoji: '❌ ' },
} as const;

export type ToastKind = keyof typeof TOAST_KIND_CONFIG;

// ---------------------------------------------------------------------------
// Guild member role
// ---------------------------------------------------------------------------
export const GUILD_ROLE_CONFIG = {
  MASTER: { label: 'Mestre' },
  VICE_MASTER: { label: 'Vice-Mestre' },
  ELITE: { label: 'Elite' },
  MEMBER: { label: 'Membro' },
  LEADER: { label: 'Líder' },
  VICE_LEADER: { label: 'Vice-Líder' },
  OFFICER: { label: 'Oficial' },
} as const;

export type GuildRole = keyof typeof GUILD_ROLE_CONFIG;

// ---------------------------------------------------------------------------
// Hunter stat keys (Strength / Intel / Vitality / Sense / Agility)
// ---------------------------------------------------------------------------
export const PLAYER_STAT_CONFIG = {
  strength: { label: 'Strength', color: '#EF4444' },
  intel: { label: 'Intel', color: '#3B82F6' },
  vitality: { label: 'Vitality', color: '#22C55E' },
  sense: { label: 'Sense', color: '#00F5FF' },
  agility: { label: 'Agility', color: '#A78BFA' },
} as const;

export type PlayerStatKey = keyof typeof PLAYER_STAT_CONFIG;
export const PLAYER_STAT_KEYS = Object.keys(PLAYER_STAT_CONFIG) as PlayerStatKey[];
