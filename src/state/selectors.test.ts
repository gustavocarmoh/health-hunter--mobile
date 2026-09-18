import { buildRankingRows, fmtXp, longestStreak, MeRow, xpPercent } from './selectors';
import { RankingEntry } from './types';

describe('fmtXp', () => {
  it('returns the raw number as a string below 1000', () => {
    expect(fmtXp(0)).toBe('0');
    expect(fmtXp(999)).toBe('999');
  });

  it('formats thousands with one decimal and a K suffix', () => {
    expect(fmtXp(1000)).toBe('1.0K');
    expect(fmtXp(12400)).toBe('12.4K');
    expect(fmtXp(9700000)).toBe('9700.0K');
  });
});

describe('xpPercent', () => {
  it('computes the rounded percentage of xp towards xpToNext', () => {
    expect(xpPercent(50, 200)).toBe(25);
    expect(xpPercent(0, 200)).toBe(0);
  });

  it('clamps at 100 even if xp exceeds xpToNext', () => {
    expect(xpPercent(500, 200)).toBe(100);
  });
});

describe('longestStreak', () => {
  it('returns 0 for an all-zero history', () => {
    expect(longestStreak([0, 0, 0])).toBe(0);
  });

  it('returns the full length for an unbroken streak', () => {
    expect(longestStreak([1, 1, 1, 1])).toBe(4);
  });

  it('finds the longest run even when it is not the most recent one', () => {
    expect(longestStreak([1, 1, 1, 0, 1, 0, 1, 1])).toBe(3);
  });
});

describe('buildRankingRows', () => {
  const ranking: RankingEntry[] = [
    { hunter_id: 'a', pos: 1, name: 'A', level: 10, rank: 'S', xp: 100, title: 'A', missions: 5, streak: 2 },
    { hunter_id: 'b', pos: 2, name: 'B', level: 20, rank: 'A', xp: 50, title: 'B', missions: 20, streak: 9 },
  ];
  const me: MeRow = { hunter_id: 'me', pos: 3, name: 'Me', level: 15, rank: 'B', xp: 75, title: 'Me', missions: 10, streak: 5 };

  it('sorts by xp descending by default', () => {
    const rows = buildRankingRows(ranking, me, 'XP');
    expect(rows.map((r) => r.name)).toEqual(['A', 'Me', 'B']);
  });

  it('sorts by level when SortBy is Level', () => {
    const rows = buildRankingRows(ranking, me, 'Level');
    expect(rows.map((r) => r.name)).toEqual(['B', 'Me', 'A']);
  });

  it('sorts by missions when SortBy is Missions', () => {
    const rows = buildRankingRows(ranking, me, 'Missions');
    expect(rows.map((r) => r.name)).toEqual(['B', 'Me', 'A']);
  });

  it('sorts by streak when SortBy is Streak', () => {
    const rows = buildRankingRows(ranking, me, 'Streak');
    expect(rows.map((r) => r.name)).toEqual(['B', 'Me', 'A']);
  });

  it('deduplicates when a ranking row shares the hunter_id with "me"', () => {
    const rankingWithMe: RankingEntry[] = [
      ...ranking,
      { hunter_id: 'me', pos: 4, name: 'Duplicate Name', level: 1, rank: 'E', xp: 999999, title: '', missions: 0, streak: 0 },
    ];
    const rows = buildRankingRows(rankingWithMe, me, 'XP');
    expect(rows.filter((r) => r.hunter_id === 'me')).toHaveLength(1);
  });
});
