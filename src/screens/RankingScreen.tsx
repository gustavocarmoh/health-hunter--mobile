import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import ScreenListContainer from '../ui/ScreenListContainer';
import { SectionLabel, OrbitronText, RajdhaniText } from '../ui/Typography';
import PressableScale from '../ui/PressableScale';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { buildRankingRows, fmtXp, MeRow } from '../state/selectors';
import { RANK_CONFIG, RANKING_SCOPE_CONFIG, RANKING_SCOPES, SORT_BY_CONFIG, SORT_BY_OPTIONS } from '../state/stateConfig';
import { RankingEntry, RankingScope, SortBy } from '../state/types';

type RankingRow = RankingEntry | MeRow;

const MEDALS = ['🥇', '🥈', '🥉'];

export default function RankingScreen() {
  const { colors } = useTheme();
  const { ranking, user, feedItems } = useAppState();
  const [scope, setScope] = useState<RankingScope>('global');
  const [sortBy, setSortBy] = useState<SortBy>('XP');

  const friendNames = useMemo(() => new Set(feedItems.map((f) => f.name)), [feedItems]);
  const me: MeRow = {
    pos: 42,
    name: user.name,
    level: user.level,
    rank: user.rank,
    xp: user.xp,
    title: 'Caçador Ativo',
    missions: user.totalMissions,
    streak: user.streak,
  };
  const rows = useMemo(() => buildRankingRows(ranking, me, friendNames, scope, sortBy), [ranking, me, friendNames, scope, sortBy]);
  const myPercentile = 25;
  const myRankPos = 42;

  const header = (
    <>
      <SectionLabel color={colors.dim} style={{ marginBottom: 16 }}>RANKING</SectionLabel>

      <View style={{ backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 18, marginBottom: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <OrbitronText weight="800" style={{ fontSize: 22, color: '#A78BFA' }}>#{myRankPos}</OrbitronText>
          <OrbitronText weight="800" style={{ fontSize: 15, color: '#00F5FF' }}>TOP {myPercentile}%</OrbitronText>
        </View>
        <RajdhaniText style={{ fontSize: 13, color: colors.muted }}>Você está entre os {myPercentile}% melhores Hunters do mundo!</RajdhaniText>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: colors.bg1, borderRadius: 10, padding: 3, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
        {RANKING_SCOPES.map((s) => {
          const active = scope === s;
          return (
            <PressableScale
              key={s}
              onPress={() => setScope(s)}
              style={{ flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center', backgroundColor: active ? '#7C3AED' : 'transparent' }}
            >
              <OrbitronText weight="700" style={{ fontSize: 11, color: active ? '#fff' : colors.muted }}>
                {RANKING_SCOPE_CONFIG[s].label}
              </OrbitronText>
            </PressableScale>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
        {SORT_BY_OPTIONS.map((s) => {
          const active = sortBy === s;
          return (
            <PressableScale
              key={s}
              scaleTo={0.94}
              onPress={() => setSortBy(s)}
              style={{
                flex: 1,
                paddingVertical: 9,
                paddingHorizontal: 4,
                borderRadius: 8,
                borderWidth: 1,
                alignItems: 'center',
                borderColor: active ? '#7C3AED' : colors.border,
                backgroundColor: active ? '#7C3AED' : 'transparent',
              }}
            >
              <OrbitronText weight="700" style={{ fontSize: 11, color: active ? '#fff' : colors.muted }}>{SORT_BY_CONFIG[s].label}</OrbitronText>
            </PressableScale>
          );
        })}
      </View>
    </>
  );

  return (
    <ScreenListContainer<RankingRow>
      header={header}
      data={rows}
      keyExtractor={(r, i) => `${r.name}-${i}`}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      ListEmptyComponent={
        scope === 'friends' ? (
          <RajdhaniText style={{ textAlign: 'center', paddingVertical: 32, paddingHorizontal: 20, color: colors.dim, fontSize: 13 }}>
            Nenhum amigo neste ranking ainda
          </RajdhaniText>
        ) : null
      }
      renderItem={({ item: r, index: i }) => {
        const isMe = r.name === user.name;
        const rc = RANK_CONFIG[r.rank];
        const rowBg = isMe ? 'rgba(124,58,237,.12)' : i < 3 ? '#141433' : colors.bg1;
        const rowBorderColor = isMe ? 'rgba(124,58,237,.4)' : colors.border;
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 10,
              backgroundColor: rowBg,
              borderWidth: 1,
              borderColor: rowBorderColor,
            }}
          >
            <OrbitronText weight="700" style={{ width: 28, textAlign: 'center', fontSize: 15, color: i < 3 ? '#FBBF24' : '#5A5A80' }}>
              {i < 3 ? MEDALS[i] : `#${i + 1}`}
            </OrbitronText>
            <View style={{ flex: 1, minWidth: 0 }}>
              <RajdhaniText weight="600" numberOfLines={1} style={{ fontSize: 14, color: colors.text }}>{r.name}</RajdhaniText>
              <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>Lv.{r.level} · {r.title}</RajdhaniText>
            </View>
            <View style={{ backgroundColor: rc.bg, borderWidth: 1, borderColor: rc.border, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 8 }}>
              <OrbitronText weight="800" style={{ fontSize: 10, color: rc.color }}>{r.rank}</OrbitronText>
            </View>
            <OrbitronText weight="700" style={{ fontSize: 12, color: '#00F5FF', width: 56, textAlign: 'right' }}>{fmtXp(r.xp)} XP</OrbitronText>
          </View>
        );
      }}
    />
  );
}
