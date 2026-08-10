import {
  CATEGORIES,
  CATEGORY_CONFIG,
  CATEGORY_FILTER_ALL,
  CATEGORY_FILTERS,
  DIFFICULTIES,
  DIFFICULTY_CONFIG,
  GUILD_ROLE_CONFIG,
  PLAYER_STAT_CONFIG,
  PLAYER_STAT_KEYS,
  RANK_CONFIG,
  RANKS,
  RARITIES,
  RARITY_CONFIG,
} from './stateConfig';

describe('CATEGORY config', () => {
  it('exposes the same keys via the type-derived CATEGORIES array', () => {
    expect([...CATEGORIES].sort()).toEqual(Object.keys(CATEGORY_CONFIG).sort());
  });

  it('prepends the ALL sentinel to the filter list without duplicating it', () => {
    expect(CATEGORY_FILTERS[0]).toBe(CATEGORY_FILTER_ALL);
    expect(CATEGORY_FILTERS.slice(1)).toEqual(CATEGORIES);
  });
});

describe('DIFFICULTY config', () => {
  it('keeps the original EASY/MEDIUM/HARD xp rewards', () => {
    expect(DIFFICULTY_CONFIG.EASY.xp).toBe(30);
    expect(DIFFICULTY_CONFIG.MEDIUM.xp).toBe(60);
    expect(DIFFICULTY_CONFIG.HARD.xp).toBe(100);
  });

  it('has a config entry for every declared difficulty', () => {
    expect([...DIFFICULTIES].sort()).toEqual(Object.keys(DIFFICULTY_CONFIG).sort());
  });
});

describe('RANK config', () => {
  it('covers all 7 ranks from E to SS, not just the top 4', () => {
    expect(RANKS).toEqual(['E', 'D', 'C', 'B', 'A', 'S', 'SS']);
  });

  it('gives every rank a color, background and border — no silent fallback needed', () => {
    RANKS.forEach((rank) => {
      const rc = RANK_CONFIG[rank];
      expect(rc.color).toBeTruthy();
      expect(rc.bg).toBeTruthy();
      expect(rc.border).toBeTruthy();
    });
  });
});

describe('RARITY config', () => {
  it('has a config entry for every declared rarity', () => {
    expect([...RARITIES].sort()).toEqual(Object.keys(RARITY_CONFIG).sort());
  });
});

describe('GUILD_ROLE config', () => {
  it('maps every role code to a Portuguese display label', () => {
    expect(GUILD_ROLE_CONFIG.MEMBER.label).toBe('Membro');
    expect(GUILD_ROLE_CONFIG.VICE_LEADER.label).toBe('Vice-Líder');
    expect(GUILD_ROLE_CONFIG.OFFICER.label).toBe('Oficial');
    expect(GUILD_ROLE_CONFIG.LEADER.label).toBe('Líder');
  });
});

describe('PLAYER_STAT config', () => {
  it('has exactly the 5 hunter stats, each with a label and color', () => {
    expect([...PLAYER_STAT_KEYS].sort()).toEqual(['agility', 'intel', 'sense', 'strength', 'vitality']);
    PLAYER_STAT_KEYS.forEach((key) => {
      expect(PLAYER_STAT_CONFIG[key].label).toBeTruthy();
      expect(PLAYER_STAT_CONFIG[key].color).toBeTruthy();
    });
  });
});
