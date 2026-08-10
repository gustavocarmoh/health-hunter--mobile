import {
  Achievement,
  BrowseGuild,
  ChallengeItem,
  EventItem,
  FeedItemData,
  Guild,
  GuildMember,
  Mission,
  OnboardingStepData,
  RankingEntry,
  UserState,
} from './types';

export const ONBOARDING_STEPS: OnboardingStepData[] = [
  { icon: '⚔️', title: 'Bem-vindo, Hunter', desc: 'Você despertou como Rank E. Complete missões diárias para ganhar XP e evoluir seus atributos.' },
  { icon: '✅', title: 'Complete Missões', desc: 'Cada missão concluída rende XP. Filtre por categoria e gere novas missões diárias a qualquer momento.' },
  { icon: '📈', title: 'Suba de Rank', desc: 'XP, streak e nível se combinam para te levar a ranks mais altos — de E até S-SS.' },
  { icon: '🏆', title: 'Explore o Mundo', desc: 'Acompanhe o ranking global, desbloqueie conquistas e participe de eventos e desafios com outros Hunters.' },
];

// All initial data now comes from backend via fetchBootstrap()
export const INITIAL_USER: UserState = {
  name: 'Hunter',
  level: 1,
  rank: 'E',
  xp: 0,
  xpToNext: 900,
  xpInCurrentLevel: 0,
  streak: 0,
  totalMissions: 0,
  achievementsCount: 0,
  statPointsAvailable: 0,
  stats: { strength: 0, intel: 0, vitality: 0, sense: 0, agility: 0 },
};

export const INITIAL_MISSIONS: Mission[] = [];
export const INITIAL_ACHIEVEMENTS: Achievement[] = [];
export const INITIAL_RANKING: RankingEntry[] = [];

export const INITIAL_GUILD: Guild = {
  name: 'Sem Guilda',
  tag: '-',
  level: 0,
  globalRank: 0,
  totalXp: 0,
  weeklyContribution: 0,
};

export const INITIAL_GUILD_MEMBERS: GuildMember[] = [];
export const INITIAL_BROWSE_GUILDS: BrowseGuild[] = [];
export const INITIAL_EVENTS: EventItem[] = [];
export const INITIAL_CHALLENGES: ChallengeItem[] = [];
export const INITIAL_FEED: FeedItemData[] = [];
export const INITIAL_STREAK_HISTORY_RAW: number[] = [];
