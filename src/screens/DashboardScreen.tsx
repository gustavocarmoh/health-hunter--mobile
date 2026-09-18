import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../ui/ScreenContainer';
import { SectionLabel, OrbitronText, RajdhaniText } from '../ui/Typography';
import Avatar from '../ui/Avatar';
import RankBadge from '../ui/RankBadge';
import ProgressBar from '../ui/ProgressBar';
import StatTriple from '../ui/StatTriple';
import PressableScale from '../ui/PressableScale';
import MissionRow from '../ui/MissionRow';
import { CalendarIcon, PeopleIcon, ShieldIcon, SnowflakeIcon, StarIcon } from '../ui/Icons';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { fmtXp, xpPercent } from '../state/selectors';
import { RootStackParamList } from '../navigation/types';
import { Mission } from '../state/types';
import HydrationModal from './HydrationModal';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { user, guild, missions, toggleMission, streakFreezes, streakProtected, useStreakFreeze, refreshDashboard } = useAppState();
  const [refreshing, setRefreshing] = useState(false);
  const [hydrationMission, setHydrationMission] = useState<Mission | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDashboard();
    setRefreshing(false);
  };

  const handleGuildNavigation = () => {
    if (guild.tag === '-') {
      navigation.navigate('GuildBrowse');
    } else {
      navigation.navigate('Guild');
    }
  };

  const dailyMissions = missions.filter((m) => m.daily);
  const dailyDone = dailyMissions.filter((m) => m.done).length;
  const percent = xpPercent(user.xpInCurrentLevel, user.xpToNext);

  const exploreLinks: { key: keyof RootStackParamList; label: string; icon: React.ReactNode }[] = [
    { key: 'Events', label: 'Eventos', icon: <CalendarIcon /> },
    { key: 'Challenges', label: 'Desafios', icon: <StarIcon color="#FBBF24" /> },
    { key: 'Friends', label: 'Amigos', icon: <PeopleIcon /> },
    { key: 'Guild', label: 'Guilda', icon: <ShieldIcon /> },
    { key: 'AiChat', label: 'Mentor IA', icon: <RajdhaniText style={{ fontSize: 17 }}>🤖</RajdhaniText> },
  ];

  const header = (
    <>
      <SectionLabel color={colors.dim} style={{ marginBottom: 20 }}>DASHBOARD</SectionLabel>

      <View style={{ backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 20, gap: 16, marginBottom: 28 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar initial={user.name[0]?.toUpperCase() ?? '?'} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <OrbitronText weight="700" numberOfLines={1} style={{ fontSize: 16, letterSpacing: 1, color: colors.text }}>{user.name}</OrbitronText>
            <RajdhaniText style={{ fontSize: 12, color: colors.muted }}>Level {user.level} · {user.xpInCurrentLevel} / {user.xpToNext} XP</RajdhaniText>
          </View>
          <RankBadge rank={user.rank} />
        </View>

        <ProgressBar percent={percent} animated={false} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: streakProtected ? 'rgba(0,245,255,.1)' : 'rgba(251,191,36,.1)',
              borderWidth: streakProtected ? 1 : 0,
              borderColor: 'rgba(0,245,255,.35)',
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: 20,
            }}
          >
            <RajdhaniText weight="600" style={{ fontSize: 12, color: streakProtected ? '#00F5FF' : '#FBBF24' }}>
              🔥 {user.streak} day streak
            </RajdhaniText>
          </View>
          <PressableScale
            onPress={useStreakFreeze}
            scaleTo={0.94}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'rgba(0,245,255,.1)',
              borderWidth: 1,
              borderColor: 'rgba(0,245,255,.3)',
              paddingVertical: 4,
              paddingHorizontal: 9,
              borderRadius: 20,
            }}
          >
            <SnowflakeIcon />
            <OrbitronText weight="700" style={{ fontSize: 11, color: '#00F5FF' }}>{streakFreezes}</OrbitronText>
          </PressableScale>
        </View>

        <StatTriple
          cells={[
            { value: fmtXp(user.xp), label: 'TOTAL XP', color: '#00F5FF' },
            { value: user.totalMissions, label: 'MISSIONS' },
            { value: user.achievementsCount, label: 'ACHIEVEMENTS' },
          ]}
        />
      </View>

      <SectionLabel color={colors.dim} style={{ fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>EXPLORE</SectionLabel>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {exploreLinks.map((link) => (
          <PressableScale
            key={link.key}
            scaleTo={0.97}
            onPress={() => {
              if (link.key === 'Guild') {
                handleGuildNavigation();
              } else {
                navigation.navigate(link.key as never);
              }
            }}
            style={{
              flex: 1,
              minWidth: 100,
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.bg1,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              paddingVertical: 12,
              paddingHorizontal: 8,
            }}
          >
            {link.icon}
            <RajdhaniText weight="600" style={{ fontSize: 11, color: colors.text }}>{link.label}</RajdhaniText>
          </PressableScale>
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <SectionLabel color={colors.dim} style={{ fontSize: 11, letterSpacing: 2 }}>DAILY MISSIONS</SectionLabel>
        <RajdhaniText style={{ fontSize: 12, color: colors.muted }}>{dailyDone}/{dailyMissions.length} done</RajdhaniText>
      </View>
    </>
  );

  return (
    <ScreenContainer header={header} refreshing={refreshing} onRefresh={onRefresh}>
      <View style={{ gap: 10 }}>
        {dailyMissions.map((m) => (
          <MissionRow
            key={m.id}
            mission={m}
            onToggle={() => toggleMission(m.id)}
            onStart={() =>
              navigation.navigate('AddActivity', {
                missionId: m.id,
                missionName: m.name,
                validationType:
                  m.validation_type === 'GPS_DISTANCE' || m.validation_type === 'DURATION'
                    ? m.validation_type
                    : undefined,
                targetDistanceM: m.target_distance_m ?? undefined,
                targetDurationSec: m.target_duration_sec ?? undefined,
              })
            }
            onHydrate={() => setHydrationMission(m)}
          />
        ))}
      </View>

      <HydrationModal mission={hydrationMission} onClose={() => setHydrationMission(null)} />
    </ScreenContainer>
  );
}
