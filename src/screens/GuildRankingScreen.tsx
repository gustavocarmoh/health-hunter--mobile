import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, FlatList } from 'react-native';
import ScreenContainer from '../ui/ScreenContainer';
import ScreenHeader from '../ui/ScreenHeader';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { fmtXp } from '../state/selectors';
import { getErrorMessage } from '../api/errors';
import guildsApi, { GuildListItem } from '../api/guilds';

const COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#10B981'];

export default function GuildRankingScreen() {
  const { colors } = useTheme();
  const { guild, showToast } = useAppState();
  const [rows, setRows] = useState<GuildListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { guilds } = await guildsApi.browse(1, 50);
      setRows(guilds);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenContainer withTabBarPadding={false} header={<ScreenHeader title="RANKING DE GUILDAS" />}>
      {loading ? (
        <View style={{ paddingVertical: 60, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item, index }) => {
            const isMine = item.id === guild.id;
            const color = COLORS[index % COLORS.length];
            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: isMine ? 'rgba(124,58,237,.12)' : colors.bg1,
                  borderWidth: 1,
                  borderColor: isMine ? 'rgba(124,58,237,.4)' : colors.border,
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <OrbitronText weight="800" style={{ fontSize: 13, color: colors.dim, width: 28 }}>
                  #{item.position}
                </OrbitronText>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                  <OrbitronText weight="800" style={{ fontSize: 11, color: '#fff' }}>{item.tag}</OrbitronText>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <RajdhaniText weight="600" numberOfLines={1} style={{ fontSize: 13, color: colors.text }}>{item.name}</RajdhaniText>
                  <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>{item.memberCount} membros</RajdhaniText>
                </View>
                <OrbitronText weight="700" style={{ fontSize: 11, color: '#FBBF24' }}>{fmtXp(item.xp)} XP</OrbitronText>
              </View>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}
