import React, { useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import ScreenListContainer from '../ui/ScreenListContainer';
import { SectionLabel, OrbitronText, RajdhaniText } from '../ui/Typography';
import PressableScale from '../ui/PressableScale';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { buildRankingRows, fmtXp, MeRow } from '../state/selectors';
import { RANK_CONFIG, RANKING_SCOPE_CONFIG, RANKING_SCOPES, SORT_BY_CONFIG, SORT_BY_OPTIONS } from '../state/stateConfig';
import { RankingEntry, RankingScope, SortBy } from '../state/types';
import leaderboardsApi from '../api/leaderboards';
import { calculateLevelFromXp } from '../api/api';

type RankingRow = RankingEntry | MeRow;

const MEDALS = ['🥇', '🥈', '🥉'];

/** Extrai o valor a exibir/comparar de uma linha do ranking conforme a aba escolhida. */
function metricFor(r: RankingRow, sortBy: SortBy): { value: number; suffix: string } {
  switch (sortBy) {
    case 'Level':
      return { value: r.level, suffix: '' };
    case 'Missions':
      return { value: r.missions, suffix: '' };
    case 'Streak':
      return { value: r.streak, suffix: '🔥' };
    default:
      return { value: r.xp, suffix: ' XP' };
  }
}

export default function RankingScreen() {
  const { colors } = useTheme();
  const { ranking, user } = useAppState();
  const [scope, setScope] = useState<RankingScope>('global');
  const [sortBy, setSortBy] = useState<SortBy>('XP');
  const [myRankPos, setMyRankPos] = useState<number | null>(null);
  const [totalHunters, setTotalHunters] = useState<number | null>(null);
  const [friendsRanking, setFriendsRanking] = useState<RankingEntry[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  useEffect(() => {
    leaderboardsApi
      .getMyPosition()
      .then((p) => {
        setMyRankPos(p.positions.global);
        setTotalHunters(p.total_hunters);
      })
      .catch(() => {
        setMyRankPos(null);
        setTotalHunters(null);
      });
  }, []);

  // Ranking de amigos vem de /leaderboards/friends (quem o hunter realmente segue) — nunca
  // filtrado por nome no ranking global, já que nomes de exibição não são únicos.
  useEffect(() => {
    if (scope !== 'friends') return;
    let mounted = true;
    setFriendsLoading(true);
    leaderboardsApi
      .getFriends()
      .then(({ leaderboard }) => {
        if (!mounted) return;
        setFriendsRanking(
          leaderboard.map((e) => ({
            hunter_id: e.hunter_id,
            pos: e.position,
            name: e.name,
            rank: e.rank as any,
            xp: e.xp,
            level: calculateLevelFromXp(e.xp || 0).level,
            title: '',
            missions: e.missions_completed || 0,
            streak: 0,
          }))
        );
      })
      .catch(() => mounted && setFriendsRanking([]))
      .finally(() => mounted && setFriendsLoading(false));
    return () => {
      mounted = false;
    };
  }, [scope]);

  const me: MeRow = {
    hunter_id: user.id,
    pos: myRankPos ?? 0,
    name: user.name,
    level: user.level,
    rank: user.rank,
    xp: user.xp,
    title: 'Caçador Ativo',
    missions: user.totalMissions,
    streak: user.streak,
  };
  const activeRanking = scope === 'friends' ? friendsRanking : ranking;
  const rows = useMemo(() => buildRankingRows(activeRanking, me, sortBy), [activeRanking, me, sortBy]);
  const myPercentile =
    myRankPos && totalHunters ? Math.max(1, Math.round((myRankPos / totalHunters) * 100)) : null;

  const header = (
    <>
      <SectionLabel color={colors.dim} style={{ marginBottom: 16 }}>RANKING</SectionLabel>

      <View style={{ backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 18, marginBottom: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <OrbitronText weight="800" style={{ fontSize: 22, color: '#A78BFA' }}>
            {myRankPos ? `#${myRankPos}` : '—'}
          </OrbitronText>
          {myPercentile !== null && (
            <OrbitronText weight="800" style={{ fontSize: 15, color: '#00F5FF' }}>TOP {myPercentile}%</OrbitronText>
          )}
        </View>
        <RajdhaniText style={{ fontSize: 13, color: colors.muted }}>
          {myPercentile !== null
            ? `Você está entre os ${myPercentile}% melhores Hunters do mundo!`
            : 'Carregando sua posição...'}
        </RajdhaniText>
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
      keyExtractor={(r, i) => `${r.hunter_id}-${i}`}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      ListEmptyComponent={
        scope === 'friends' ? (
          friendsLoading ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          ) : (
            <RajdhaniText style={{ textAlign: 'center', paddingVertical: 32, paddingHorizontal: 20, color: colors.dim, fontSize: 13 }}>
              Você ainda não segue nenhum hunter. Adicione amigos pra ver o ranking deles aqui!
            </RajdhaniText>
          )
        ) : null
      }
      renderItem={({ item: r, index: i }) => {
        const isMe = r.hunter_id === user.id;
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
            <OrbitronText weight="700" style={{ fontSize: 12, color: '#00F5FF', width: 64, textAlign: 'right' }}>
              {(() => {
                const { value, suffix } = metricFor(r, sortBy);
                return sortBy === 'XP' ? `${fmtXp(value)}${suffix}` : `${value}${suffix}`;
              })()}
            </OrbitronText>
          </View>
        );
      }}
    />
  );
}
