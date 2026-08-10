import { Rank, RankingScope, SortBy } from './types';

export function fmtXp(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);
}

export function xpPercent(xp: number, xpToNext: number): number {
  return Math.min(100, Math.round((xp / xpToNext) * 100));
}

export function longestStreak(raw: number[]): number {
  let best = 0;
  let cur = 0;
  raw.forEach((v) => {
    cur = v ? cur + 1 : 0;
    best = Math.max(best, cur);
  });
  return best;
}

export interface MeRow {
  pos: number;
  name: string;
  level: number;
  rank: Rank;
  xp: number;
  title: string;
  missions: number;
  streak: number;
}

type NumericRankingKey = 'xp' | 'level' | 'missions' | 'streak';

const SORT_KEY_BY_SORT_BY: Record<SortBy, NumericRankingKey> = {
  XP: 'xp',
  Level: 'level',
  Missions: 'missions',
  Streak: 'streak',
};

export function buildRankingRows<
  T extends Record<NumericRankingKey, number> & { name: string; rank: Rank; title: string }
>(ranking: T[], me: MeRow, friendNames: Set<string>, scope: RankingScope, sortBy: SortBy) {
  let all: (T | MeRow)[] = [...ranking, me];
  if (scope === 'friends') {
    all = all.filter((r) => friendNames.has(r.name) || r.name === me.name);
  }
  const sortKey = SORT_KEY_BY_SORT_BY[sortBy];
  const sorted = [...all].sort((a, b) => b[sortKey] - a[sortKey]);
  return sorted;
}
