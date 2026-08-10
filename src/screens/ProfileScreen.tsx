import React, { useState } from 'react';
import { TextInput, useWindowDimensions, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import ScreenContainer from '../ui/ScreenContainer';
import { SectionLabel, OrbitronText, RajdhaniText } from '../ui/Typography';
import AvatarPicker from '../ui/AvatarPicker';
import RankBadge from '../ui/RankBadge';
import ProgressBar from '../ui/ProgressBar';
import StatTriple from '../ui/StatTriple';
import PressableScale from '../ui/PressableScale';
import { SettingsGearIcon, EditPencilIcon, WarningTriangleIcon } from '../ui/Icons';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { fmtXp, longestStreak, xpPercent } from '../state/selectors';
import { PLAYER_STAT_CONFIG, PLAYER_STAT_KEYS } from '../state/stateConfig';
import { RootStackParamList } from '../navigation/types';
import huntersApi from '../api/hunters';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STREAK_COLUMNS = 7;
const STREAK_GAP = 6;
const SCREEN_PADDING = 40; // ScreenContainer's horizontal padding (20 left + 20 right)

export default function ProfileScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { width: winWidth } = useWindowDimensions();
  const { user, saveName, avatarUri, setAvatarUri, streakHistoryRaw, deactivateAccount, showToast, setUser } = useAppState();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.name);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [allocatingTo, setAllocatingTo] = useState<string | null>(null);

  const percent = xpPercent(user.xpInCurrentLevel, user.xpToNext);
  const record = longestStreak(streakHistoryRaw);
  const streakCellSize = (winWidth - SCREEN_PADDING - STREAK_GAP * (STREAK_COLUMNS - 1)) / STREAK_COLUMNS;

  const commitName = () => {
    setIsEditingName(false);
    if (nameDraft.trim()) saveName(nameDraft);
    else setNameDraft(user.name);
  };

  const doLogout = () => {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Landing' }] }));
  };

  const confirmDeactivate = () => {
    setConfirmingDeactivate(false);
    deactivateAccount();
    setTimeout(doLogout, 900);
  };

  const allocateStat = async (attribute: string) => {
    try {
      setAllocatingTo(attribute);
      const result = await huntersApi.allocateStat(attribute);
      setUser({
        stats: result.stats as any,
        statPointsAvailable: result.stats.stat_points_available,
      });
      showToast(`+1 ${attribute}!`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao alocar ponto';
      showToast(msg, 'error');
    } finally {
      setAllocatingTo(null);
    }
  };

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 34, marginBottom: 20 }}>
        <SectionLabel color={colors.dim}>PROFILE</SectionLabel>
        <PressableScale onPress={() => navigation.navigate('Settings')} scaleTo={0.9} style={{ padding: 4 }}>
          <SettingsGearIcon color={colors.dim} />
        </PressableScale>
      </View>

      <View style={{ alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <AvatarPicker uri={avatarUri} onChange={setAvatarUri} />
        {isEditingName ? (
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            onSubmitEditing={commitName}
            onBlur={commitName}
            autoFocus
            style={{
              fontFamily: 'Orbitron_700Bold',
              fontSize: 18,
              textAlign: 'center',
              backgroundColor: colors.bg1,
              borderWidth: 1,
              borderColor: '#00F5FF',
              borderRadius: 8,
              paddingVertical: 6,
              paddingHorizontal: 10,
              color: '#00F5FF',
              minWidth: 160,
            }}
          />
        ) : (
          <PressableScale
            onPress={() => {
              setNameDraft(user.name);
              setIsEditingName(true);
            }}
            scaleTo={0.96}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 }}
          >
            <OrbitronText weight="700" style={{ fontSize: 18, color: colors.text }}>{user.name}</OrbitronText>
            <EditPencilIcon color={colors.dim} />
          </PressableScale>
        )}
        <RankBadge rank={user.rank} />
      </View>

      <ProgressBar percent={percent} animated={false} />
      <RajdhaniText style={{ textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 10, marginBottom: 16 }}>
        {user.xpInCurrentLevel} / {user.xpToNext} XP
      </RajdhaniText>

      <StatTriple
        cells={[
          { value: fmtXp(user.xp), label: 'TOTAL XP', color: '#00F5FF' },
          { value: user.totalMissions, label: 'MISSIONS' },
          { value: user.streak, label: 'STREAK', color: '#FBBF24' },
        ]}
      />
      <View style={{ height: 24 }} />

      <SectionLabel color={colors.dim} style={{ fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>HUNTER STATS</SectionLabel>
      <View style={{ gap: 10, marginBottom: 28 }}>
        {PLAYER_STAT_KEYS.map((key) => {
          const stat = PLAYER_STAT_CONFIG[key];
          const value = user.stats[key];
          const isLoading = allocatingTo === key;
          const canAllocate = user.statPointsAvailable > 0;
          return (
            <PressableScale
              key={key}
              onPress={() => canAllocate && allocateStat(key)}
              scaleTo={canAllocate ? 0.98 : 1}
              disabled={!canAllocate || isLoading}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                opacity: canAllocate ? 1 : 0.6,
              }}
            >
              <RajdhaniText style={{ width: 74, fontSize: 12, color: colors.muted }}>{stat.label}</RajdhaniText>
              <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${Math.min(value, 100)}%`, borderRadius: 3, backgroundColor: stat.color }} />
              </View>
              <RajdhaniText weight="600" style={{ width: 32, textAlign: 'right', fontSize: 12, color: colors.text }}>
                {isLoading ? '→' : value}
              </RajdhaniText>
            </PressableScale>
          );
        })}
      </View>

      {user.statPointsAvailable > 0 && (
        <View style={{ backgroundColor: colors.bg1, borderWidth: 1, borderColor: '#7C3AED', borderRadius: 8, padding: 12, marginBottom: 28, alignItems: 'center' }}>
          <RajdhaniText weight="600" style={{ fontSize: 12, color: '#7C3AED' }}>
            {user.statPointsAvailable} ponto{user.statPointsAvailable > 1 ? 's' : ''} disponível{user.statPointsAvailable > 1 ? 's' : ''}
          </RajdhaniText>
          <RajdhaniText style={{ fontSize: 10, color: colors.muted, marginTop: 4 }}>Toque em um atributo para distribuir</RajdhaniText>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <SectionLabel color={colors.dim} style={{ fontSize: 11, letterSpacing: 2 }}>STREAK HISTORY</SectionLabel>
        <RajdhaniText style={{ fontSize: 11, color: colors.muted }}>recorde: {record} dias</RajdhaniText>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: STREAK_GAP, marginBottom: 28 }}>
        {streakHistoryRaw.map((v, i) => {
          const isToday = i === streakHistoryRaw.length - 1;
          return (
            <View
              key={i}
              style={{
                width: streakCellSize,
                height: streakCellSize,
                borderRadius: 4,
                backgroundColor: v ? '#FBBF24' : colors.bg1,
                borderWidth: isToday ? 2 : v ? 0 : 1,
                borderColor: isToday ? '#00F5FF' : colors.border,
              }}
            />
          );
        })}
      </View>

      <PressableScale
        onPress={doLogout}
        scaleTo={0.98}
        style={{ paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg1, alignItems: 'center', marginBottom: 24 }}
      >
        <OrbitronText weight="700" style={{ fontSize: 13, color: colors.text }}>LOGOUT</OrbitronText>
      </PressableScale>

      <View style={{ borderWidth: 1, borderColor: 'rgba(239,68,68,.2)', backgroundColor: 'rgba(239,68,68,.04)', borderRadius: 12, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <WarningTriangleIcon />
          <OrbitronText weight="700" style={{ fontSize: 11, letterSpacing: 2, color: '#EF4444' }}>DANGER ZONE</OrbitronText>
        </View>
        {!confirmingDeactivate ? (
          <PressableScale
            onPress={() => setConfirmingDeactivate(true)}
            scaleTo={0.97}
            style={{ paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,.4)', alignItems: 'center' }}
          >
            <OrbitronText weight="700" style={{ fontSize: 12, color: '#EF4444' }}>DEACTIVATE ACCOUNT</OrbitronText>
          </PressableScale>
        ) : (
          <View>
            <RajdhaniText style={{ fontSize: 12, color: colors.muted, marginBottom: 10 }}>
              Tem certeza? Sua conta ficará inativa até um novo login.
            </RajdhaniText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <PressableScale
                onPress={() => setConfirmingDeactivate(false)}
                scaleTo={0.96}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg1, alignItems: 'center' }}
              >
                <OrbitronText weight="700" style={{ fontSize: 11, color: colors.muted }}>CANCEL</OrbitronText>
              </PressableScale>
              <PressableScale
                onPress={confirmDeactivate}
                scaleTo={0.96}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center' }}
              >
                <OrbitronText weight="700" style={{ fontSize: 11, color: '#fff' }}>CONFIRM</OrbitronText>
              </PressableScale>
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
