import { Rank, SortBy } from './types';

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

type NumericRankingKey = 'xp' | 'level' | 'missions' | 'streak';

const SORT_KEY_BY_SORT_BY: Record<SortBy, NumericRankingKey> = {
  XP: 'xp',
  Level: 'level',
  Missions: 'missions',
  Streak: 'streak',
};

// A escolha de QUAL conjunto de dados usar (ranking global vs. só amigos reais, vindos de
// /leaderboards/friends) já acontece antes de chamar isso — aqui só junta "eu" na lista e
// ordena pela aba escolhida. Identifica "eu" por hunter_id, nunca por nome (nomes não são
// únicos — duas contas podem se chamar igual).
export function buildRankingRows<
  T extends Record<NumericRankingKey, number> & { hunter_id: string; name: string; rank: Rank; title: string }
>(ranking: T[], me: MeRow, sortBy: SortBy) {
  const withoutMe = ranking.filter((r) => r.hunter_id !== me.hunter_id);
  const all: (T | MeRow)[] = [...withoutMe, me];
  const sortKey = SORT_KEY_BY_SORT_BY[sortBy];
  return [...all].sort((a, b) => b[sortKey] - a[sortKey]);
}
