import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { playXpChime } from '../audio/xpChime';
import { levelUpHaptic, unlockHaptic, xpHaptic } from '../audio/haptics';
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
  ToastKind,
  UserState,
} from './types';
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
  ONBOARDING_STEPS,
} from './data';
import { api, calculateLevelFromXp } from '../api/api';
import { debugBootstrap } from '../utils/debugBootstrap';

interface Toast {
  message: string;
  kind: ToastKind;
  nonce: number;
}

interface ConfettiState {
  active: boolean;
  levelLabel: string;
  nonce: number;
}

const AVATAR_KEY = 'solo-leveling:avatarUri';
const PREFS_KEY = 'solo-leveling:prefs';
const PROGRESS_KEY = 'solo-leveling:progress';

/** Everything that represents the hunter's actual progress — persisted so it survives app restarts. */
interface PersistedProgress {
  user: UserState;
  missions: Mission[];
  achievements: Achievement[];
  guild: Guild;
  guildMembers: GuildMember[];
  events: EventItem[];
  challenges: ChallengeItem[];
  streakFreezes: number;
  streakProtected: boolean;
}

interface AppState {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
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
  avatarUri: string | null;
  toast: Toast | null;
  showOnboarding: boolean;
  onboardingStep: number;
  confetti: ConfettiState;
  unlockedAchievement: Achievement | null;
  isBootstrapped: boolean;
  bootstrapError: string | null;
  dailyMissionsLocked: boolean;
}

interface AppStateContextValue extends AppState {
  retryBootstrap: () => void;
  showToast: (message: string, kind?: ToastKind) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleNotifications: () => void;
  toggleMission: (id: string) => Promise<void>;
  addMission: (m: { name: string; category: Mission['category']; difficulty: Difficulty }) => void;
  generateDaily: () => Promise<boolean>;
  saveName: (name: string) => void;
  registerHunter: (name: string) => void;
  refreshDashboard: () => Promise<void>;
  useStreakFreeze: () => void;
  toggleEvent: (id: number) => void;
  toggleChallenge: (id: number) => void;
  joinGuild: (g: BrowseGuild) => void;
  leaveGuild: () => void;
  setAvatarUri: (uri: string | null) => void;
  deactivateAccount: () => void;
  nextOnboarding: () => void;
  skipOnboarding: () => void;
  startOnboarding: () => void;
  dismissUnlockPopup: () => void;
  setUser: (userData: Partial<UserState>) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [user, setUser] = useState<UserState>(INITIAL_USER);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [ranking, setRanking] = useState<RankingEntry[]>(INITIAL_RANKING);
  const [guild, setGuild] = useState<Guild>(INITIAL_GUILD);
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>(INITIAL_GUILD_MEMBERS);
  const [guildQuestProgress, setGuildQuestProgress] = useState(62);
  const [browseGuilds, setBrowseGuilds] = useState<BrowseGuild[]>(INITIAL_BROWSE_GUILDS);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [challenges, setChallenges] = useState<ChallengeItem[]>(INITIAL_CHALLENGES);
  const [feedItems, setFeedItems] = useState<FeedItemData[]>(INITIAL_FEED);
  const [streakHistoryRaw, setStreakHistoryRaw] = useState<number[]>(INITIAL_STREAK_HISTORY_RAW);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [streakFreezes, setStreakFreezes] = useState(2);
  const [streakProtected, setStreakProtected] = useState(false);
  const [avatarUri, setAvatarUriState] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiState>({ active: false, levelLabel: '', nonce: 0 });
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [dailyMissionsLocked, setDailyMissionsLocked] = useState(false);

  const [isProgressHydrated, setIsProgressHydrated] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastCounter = useRef(0);
  const confettiCounter = useRef(0);
  const progressSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bootstraps app data from the real API backend.
  const loadBootstrap = useCallback(async () => {
    try {
      // Debug: Check connectivity before bootstrap
      await debugBootstrap();

      const boot = await api.fetchBootstrap();
      console.log('📦 Bootstrap data:', {
        guild: boot.guild,
        guildMembers: boot.guildMembers,
      });

      // Validate and recalculate level from XP to ensure consistency
      const { level: recalculatedLevel, xpToNext: recalculatedXpToNext, xpInCurrentLevel: recalculatedXpInCurrentLevel } = calculateLevelFromXp(boot.user.xp);
      const validatedUser = {
        ...boot.user,
        level: recalculatedLevel,
        xpToNext: recalculatedXpToNext,
        xpInCurrentLevel: recalculatedXpInCurrentLevel,
      };

      if (boot.user.level !== recalculatedLevel) {
        console.log(`⚠️  Level mismatch detected. Backend said level ${boot.user.level}, but XP ${boot.user.xp} corresponds to level ${recalculatedLevel}. Using recalculated level.`);
      }

      setUser(validatedUser);
      setMissions(boot.missions);
      setAchievements(boot.achievements);
      setRanking(boot.ranking);

      // Debug: Check if guild is being set
      if (boot.guild && boot.guild.name && boot.guild.name !== 'Sem Guilda') {
        console.log('✅ Setting guild:', boot.guild.name);
        console.log('   Full guild object:', boot.guild);
        setGuild(boot.guild);
      } else {
        console.log('⚠️ No guild loaded, using default "Sem Guilda"');
        setGuild(INITIAL_GUILD);
      }
      setGuildMembers(boot.guildMembers);
      setGuildQuestProgress(boot.guildQuestProgress);
      setBrowseGuilds(boot.browseGuilds);
      setEvents(boot.events);
      setChallenges(boot.challenges);
      setFeedItems(boot.feedItems);
      setStreakHistoryRaw(boot.streakHistoryRaw);
      setStreakFreezes(boot.streakFreezes);
      setStreakProtected(boot.streakProtected);
      setDailyMissionsLocked(false);
      setBootstrapError(null);
      return true;
    } catch (error) {
      console.error('Bootstrap error:', error);
      setBootstrapError('Não foi possível sincronizar com o servidor. Mostrando dados salvos localmente.');
      return false;
    } finally {
      setIsBootstrapped(true);
    }
  }, []);

  const retryBootstrap = useCallback(() => {
    loadBootstrap().then((ok) => {
      if (ok) showToast('Sincronizado com sucesso');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadBootstrap]);

  useEffect(() => {
    const initializeApp = async () => {
      // Load avatar from storage
      const uri = await AsyncStorage.getItem(AVATAR_KEY);
      if (uri) setAvatarUriState(uri);

      // Load preferences from storage
      const raw = await AsyncStorage.getItem(PREFS_KEY);
      if (raw) {
        try {
          const prefs = JSON.parse(raw);
          if (typeof prefs.soundEnabled === 'boolean') setSoundEnabled(prefs.soundEnabled);
          if (typeof prefs.hapticsEnabled === 'boolean') setHapticsEnabled(prefs.hapticsEnabled);
          if (typeof prefs.notificationsEnabled === 'boolean') setNotificationsEnabled(prefs.notificationsEnabled);
        } catch {
          // ignore corrupt prefs
        }
      }

      // Only bootstrap if we have a token
      const { TokenStorage } = await import('../api/tokenStorage');
      const token = await TokenStorage.getAccessToken();
      if (token) {
        loadBootstrap().then(() => {
          // Don't load old saved data - bootstrap from backend is always fresh
          // This prevents stale "Sem Guilda" data from overwriting real guild data
          setIsProgressHydrated(true);
        });
      } else {
        // No token, just mark as bootstrapped without loading data
        setIsBootstrapped(true);
        setIsProgressHydrated(true);
      }
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist progress on every change, once initial hydration has finished (debounced to
  // avoid a flurry of writes when a single action triggers several state updates at once,
  // e.g. completing a mission touches missions + user + achievements).
  useEffect(() => {
    if (!isProgressHydrated) return;
    if (progressSaveTimer.current) clearTimeout(progressSaveTimer.current);
    progressSaveTimer.current = setTimeout(() => {
      const snapshot: PersistedProgress = {
        user, missions, achievements, guild, guildMembers, events, challenges, streakFreezes, streakProtected,
      };
      AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(snapshot)).catch(() => {});
    }, 400);
    return () => {
      if (progressSaveTimer.current) clearTimeout(progressSaveTimer.current);
    };
  }, [isProgressHydrated, user, missions, achievements, guild, guildMembers, events, challenges, streakFreezes, streakProtected]);

  const prefsRef = useRef({ soundEnabled, hapticsEnabled, notificationsEnabled });
  useEffect(() => {
    prefsRef.current = { soundEnabled, hapticsEnabled, notificationsEnabled };
  }, [soundEnabled, hapticsEnabled, notificationsEnabled]);

  const persistPrefs = useCallback((next: Partial<{ soundEnabled: boolean; hapticsEnabled: boolean; notificationsEnabled: boolean }>) => {
    const merged = { ...prefsRef.current, ...next };
    prefsRef.current = merged;
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify(merged)).catch(() => {});
  }, []);

  const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (kind === 'xp') {
      xpHaptic(hapticsEnabled);
      if (soundEnabled) playXpChime();
    }
    toastCounter.current += 1;
    setToast({ message, kind, nonce: toastCounter.current });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, [hapticsEnabled, soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      persistPrefs({ soundEnabled: next });
      showToast(next ? 'Som ativado 🔊' : 'Som desativado 🔇');
      return next;
    });
  }, [persistPrefs, showToast]);

  const toggleHaptics = useCallback(() => {
    setHapticsEnabled((prev) => {
      const next = !prev;
      persistPrefs({ hapticsEnabled: next });
      showToast(next ? 'Vibração ativada' : 'Vibração desativada');
      return next;
    });
  }, [persistPrefs, showToast]);

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled((prev) => {
      const next = !prev;
      persistPrefs({ notificationsEnabled: next });
      return next;
    });
  }, [persistPrefs]);

  const triggerLevelUp = useCallback((level: number) => {
    levelUpHaptic(hapticsEnabled);
    if (soundEnabled) playXpChime();
    confettiCounter.current += 1;
    setConfetti({ active: true, levelLabel: `Level ${level}`, nonce: confettiCounter.current });
    setTimeout(() => setConfetti((c) => ({ ...c, active: false })), 2400);
  }, [hapticsEnabled, soundEnabled]);

  const showAchievementUnlock = useCallback((ach: Achievement) => {
    unlockHaptic(hapticsEnabled);
    if (soundEnabled) playXpChime();
    setUnlockedAchievement(ach);
  }, [hapticsEnabled, soundEnabled]);

  const toggleMission = useCallback(async (id: string): Promise<void> => {
    // Find mission locally
    const target = missions.find((m) => m.id === id);
    if (!target) return;

    const nextDone = !target.done;
    const delta = target.done ? -target.xp : target.xp;

    try {
      // 1. Update backend first
      console.log('📤 Updating mission on backend:', id, nextDone);
      await api.updateMissionDone(id, nextDone);
      console.log('✅ Mission updated on backend');

      // 2. Only update local state AFTER backend confirms
      setMissions((prevMissions) =>
        prevMissions.map((m) => (m.id === id ? { ...m, done: nextDone } : m))
      );

      // 3. Sync XP from backend (backend updated user.xp on mission completion)
      if (delta !== 0) {
        console.log('🔄 Syncing user XP from backend...');
        const updatedUser = await api.auth.getMe();

        setUser((prevUser) => {
          const newXp = updatedUser.xp || prevUser.xp;
          let nextUser = { ...prevUser, xp: newXp };

          if (delta > 0) {
            showToast(`+${delta} XP ganho!`, 'xp');
            setAchievements((prevAch) => {
              const toUnlock = prevAch.find((a) => !a.unlocked && a.unlockAt && newXp >= a.unlockAt);
              if (!toUnlock) return prevAch;
              setTimeout(() => showAchievementUnlock(toUnlock), 700);
              return prevAch.map((a) => (a.id === toUnlock.id ? { ...a, unlocked: true } : a));
            });
            // Recalculate level and xpToNext based on new XP total
            const { level: newLevel, xpToNext: newXpToNext, xpInCurrentLevel: newXpInCurrentLevel } = calculateLevelFromXp(newXp);
            if (newLevel > prevUser.level) {
              nextUser = {
                ...nextUser,
                level: newLevel,
                xpToNext: newXpToNext,
                xpInCurrentLevel: newXpInCurrentLevel,
              };
              setTimeout(() => triggerLevelUp(newLevel), 300);
            } else {
              // Even if no level up, update xpInCurrentLevel
              nextUser = {
                ...nextUser,
                xpInCurrentLevel: newXpInCurrentLevel,
              };
            }
          }
          return nextUser;
        });
      }
    } catch (err) {
      console.error('❌ Error toggling mission:', err);
      showToast('Erro ao atualizar missão', 'error');
    }
  }, [missions, showToast, showAchievementUnlock, triggerLevelUp]);

  const addMission = useCallback((m: { name: string; category: Mission['category']; difficulty: Difficulty }) => {
    api.createMission(m).then((newMission) => {
      setMissions((prev) => [...prev, newMission]);
      showToast('Missão criada!');
    });
  }, [showToast]);

  const generateDaily = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🎯 Generating daily missions...');
      let alreadyGenerated = false;

      try {
        await api.generateDailyMissions();
      } catch (err: any) {
        if (err.response?.status === 409) {
          console.log('⚠️ Missions already generated today');
          alreadyGenerated = true;
          setDailyMissionsLocked(true);
        } else {
          throw err;
        }
      }

      // Recarregar todas as missões do servidor
      console.log('🔄 Reloading missions from server...');
      const { missions: missoesCarregadas } = await api.fetchBootstrap();
      setMissions(missoesCarregadas || []);

      if (alreadyGenerated) {
        showToast('Limite diário de geração atingido. Volte amanhã!', 'info');
        return false;
      } else {
        showToast('✨ 3 novas missões geradas!');
        return true;
      }
    } catch (err: any) {
      console.error('Error generating daily missions:', err);
      showToast('Erro ao gerar missões', 'error');
      return false;
    }
  }, [showToast]);

  const saveName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUser((prev) => ({ ...prev, name: trimmed }));
  }, []);

  const registerHunter = useCallback((name: string) => {
    setUser((prev) => ({ ...prev, name }));
    setShowOnboarding(true);
    setOnboardingStep(0);
  }, []);

  const refreshDashboard = useCallback(async () => {
    try {
      console.log('🔄 Refreshing dashboard data...');
      const bootstrapData = await api.fetchBootstrap();

      // Atualizar estado com dados do bootstrap
      if (bootstrapData.user) {
        // Validate and recalculate level from XP to ensure consistency
        const { level: recalculatedLevel, xpToNext: recalculatedXpToNext, xpInCurrentLevel: recalculatedXpInCurrentLevel } = calculateLevelFromXp(bootstrapData.user.xp);
        const validatedUser = {
          ...bootstrapData.user,
          level: recalculatedLevel,
          xpToNext: recalculatedXpToNext,
          xpInCurrentLevel: recalculatedXpInCurrentLevel,
        };
        setUser(validatedUser);
      }
      if (bootstrapData.guild) setGuild(bootstrapData.guild);
      if (bootstrapData.guildMembers) setGuildMembers(bootstrapData.guildMembers);
      if (bootstrapData.missions) setMissions(bootstrapData.missions);
      if (bootstrapData.challenges) setChallenges(bootstrapData.challenges);
      if (bootstrapData.browseGuilds) setBrowseGuilds(bootstrapData.browseGuilds);

      console.log('✅ Dashboard refreshed');
    } catch (err) {
      console.error('❌ Error refreshing dashboard:', err);
      showToast('Erro ao atualizar dados', 'error');
    }
  }, [showToast]);

  const useStreakFreeze = useCallback(() => {
    if (streakProtected) return showToast('Sequência já está protegida ❄️');
    if (streakFreezes <= 0) return showToast('Sem congelamentos disponíveis');
    setStreakFreezes((prev) => prev - 1);
    setStreakProtected(true);
    showToast('Sequência protegida por 24h ❄️');
  }, [streakFreezes, streakProtected, showToast]);

  const toggleEvent = useCallback((id: number) => {
    setEvents((prev) => {
      const target = prev.find((e) => e.id === id);
      if (!target) return prev;
      api.updateEventJoined(id, !target.joined).catch(() => {});
      return prev.map((e) => (e.id === id ? { ...e, joined: !e.joined } : e));
    });
  }, []);

  const toggleChallenge = useCallback((id: number) => {
    setChallenges((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;
      api.updateChallengeJoined(id, !target.joined).catch(() => {});
      return prev.map((c) => (c.id === id ? { ...c, joined: !c.joined } : c));
    });
  }, []);

  const joinGuild = useCallback((g: BrowseGuild) => {
    api.joinGuild(g, { name: user.name, xp: user.xp }).then((result) => {
      setGuild(result.guild);
      setGuildMembers(result.guildMembers);
      showToast(`Você entrou em ${g.name}!`);
    });
  }, [user.name, user.xp, showToast]);

  const leaveGuild = useCallback(async () => {
    try {
      await api.guilds.leave();
      setGuild(INITIAL_GUILD);
      setGuildMembers(INITIAL_GUILD_MEMBERS);
      setGuildQuestProgress(0);
      showToast('Você saiu da guilda');
    } catch (err) {
      console.error('Error leaving guild:', err);
      showToast('Erro ao sair da guilda', 'error');
    }
  }, [showToast]);

  const setAvatarUri = useCallback((uri: string | null) => {
    setAvatarUriState(uri);
    if (uri) AsyncStorage.setItem(AVATAR_KEY, uri).catch(() => {});
    else AsyncStorage.removeItem(AVATAR_KEY).catch(() => {});
  }, []);

  const deactivateAccount = useCallback(() => {
    showToast('Conta desativada.');
  }, [showToast]);

  const nextOnboarding = useCallback(() => {
    setOnboardingStep((step) => {
      if (step >= ONBOARDING_STEPS.length - 1) {
        setShowOnboarding(false);
        return step;
      }
      return step + 1;
    });
  }, []);
  const skipOnboarding = useCallback(() => setShowOnboarding(false), []);
  const startOnboarding = useCallback(() => {
    setShowOnboarding(true);
    setOnboardingStep(0);
  }, []);

  const dismissUnlockPopup = useCallback(() => setUnlockedAchievement(null), []);

  const setUser_External = useCallback((userData: Partial<UserState>) => {
    setUser((prev) => ({ ...prev, ...userData }));
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      soundEnabled,
      hapticsEnabled,
      notificationsEnabled,
      user,
      missions,
      achievements,
      ranking,
      guild,
      guildMembers,
      guildQuestProgress,
      browseGuilds,
      events,
      challenges,
      feedItems,
      streakHistoryRaw,
      streakFreezes,
      streakProtected,
      avatarUri,
      toast,
      showOnboarding,
      onboardingStep,
      confetti,
      unlockedAchievement,
      dailyMissionsLocked,
      isBootstrapped,
      bootstrapError,
      retryBootstrap,
      showToast,
      toggleSound,
      toggleHaptics,
      toggleNotifications,
      toggleMission,
      addMission,
      generateDaily,
      saveName,
      registerHunter,
      refreshDashboard,
      useStreakFreeze,
      toggleEvent,
      toggleChallenge,
      joinGuild,
      leaveGuild,
      setAvatarUri,
      deactivateAccount,
      nextOnboarding,
      skipOnboarding,
      startOnboarding,
      dismissUnlockPopup,
      setUser: setUser_External,
    }),
    [
      soundEnabled, hapticsEnabled, notificationsEnabled, user, missions, achievements, ranking,
      guild, guildMembers, guildQuestProgress, browseGuilds, events, challenges, feedItems,
      streakHistoryRaw, streakFreezes, streakProtected, avatarUri, toast, showOnboarding,
      onboardingStep, confetti, unlockedAchievement, dailyMissionsLocked, isBootstrapped, bootstrapError, retryBootstrap,
      showToast, toggleSound, toggleHaptics,
      toggleNotifications, toggleMission, addMission, generateDaily, saveName, registerHunter,
      refreshDashboard, useStreakFreeze, toggleEvent, toggleChallenge, joinGuild, leaveGuild,
      setAvatarUri, deactivateAccount, nextOnboarding, skipOnboarding, startOnboarding, dismissUnlockPopup, setUser_External,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

export { ONBOARDING_STEPS };
