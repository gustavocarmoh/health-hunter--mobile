import { api } from './mockApi';

describe('api.createMission', () => {
  it('derives xp and icon from the difficulty/category config', async () => {
    const mission = await api.createMission({ name: '  Ler 10 páginas  ', category: 'STUDY', difficulty: 'HARD' });
    expect(mission.name).toBe('Ler 10 páginas');
    expect(mission.xp).toBe(100);
    expect(mission.icon).toBe('📚');
    expect(mission.done).toBe(false);
    expect(mission.daily).toBe(false);
  });
});

describe('api.generateDailyMissions', () => {
  it('returns undone, non-daily missions with unique ids', async () => {
    const missions = await api.generateDailyMissions();
    expect(missions.length).toBeGreaterThan(0);
    missions.forEach((m) => {
      expect(m.done).toBe(false);
      expect(m.daily).toBe(false);
    });
    const ids = missions.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('api.joinGuild', () => {
  it('builds a guild record and a single-member roster for the joining hunter', async () => {
    const result = await api.joinGuild(
      { id: 'guild-1', name: 'Knights of Rune', tag: 'KOR', level: 15, memberCount: 42, color: '#EF4444', position: 5, xp: 300000 },
      { id: 'user-1', name: 'SungJinWoo_Jr', xp: 12400 }
    );
    expect(result.guild.name).toBe('Knights of Rune');
    expect(result.guild.globalRank).toBe(5); // max(1, 20 - 15)
    expect(result.guildMembers).toHaveLength(1);
    expect(result.guildMembers[0]).toMatchObject({ name: 'SungJinWoo_Jr', role: 'MEMBER', isMe: true });
  });
});
