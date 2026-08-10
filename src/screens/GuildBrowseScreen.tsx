import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../ui/ScreenContainer';
import ScreenHeader from '../ui/ScreenHeader';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import PressableScale from '../ui/PressableScale';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { getErrorMessage } from '../api/errors';
import guildsApi from '../api/guilds';

export default function GuildBrowseScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { browseGuilds, showToast, refreshDashboard } = useAppState();
  const [joining, setJoining] = useState<string | null>(null);

  const onJoin = async (g: (typeof browseGuilds)[number]) => {
    setJoining(g.id);
    try {
      console.log('🏰 Joining guild:', g.id);
      await guildsApi.join(g.id);
      console.log('✅ Joined guild, refreshing data...');

      // Recarregar dados da guilda do backend
      await refreshDashboard();

      showToast('✨ Entrou na guilda!');
      navigation.goBack();
    } catch (err) {
      console.error('❌ Join error:', err);
      showToast(getErrorMessage(err), 'error');
    } finally {
      setJoining(null);
    }
  };

  return (
    <ScreenContainer withTabBarPadding={false} header={<ScreenHeader title="BUSCAR GUILDAS" />}>
      <PressableScale
        onPress={() => navigation.navigate('CreateGuild')}
        scaleTo={0.97}
        style={{
          marginBottom: 16,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 10,
          backgroundColor: '#7C3AED',
          borderWidth: 2,
          borderColor: '#7C3AED',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <OrbitronText weight="800" style={{ fontSize: 12, color: '#fff' }}>
          ✨ CRIAR GUILDA
        </OrbitronText>
      </PressableScale>

      <View style={{ gap: 10 }}>
        {browseGuilds.map((g, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14 }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: g.color, alignItems: 'center', justifyContent: 'center' }}>
              <OrbitronText weight="800" style={{ fontSize: 13, color: '#fff' }}>{g.tag}</OrbitronText>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <RajdhaniText weight="700" numberOfLines={1} style={{ fontSize: 14, color: colors.text }}>{g.name}</RajdhaniText>
              <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>Nível {g.level} · {g.memberCount} membros</RajdhaniText>
            </View>
            <PressableScale
              onPress={() => onJoin(g)}
              disabled={joining !== null}
              scaleTo={0.95}
              style={{
                minHeight: 32,
                justifyContent: 'center',
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: joining === g.id ? '#7C3AED' : 'rgba(124,58,237,.4)',
                backgroundColor: joining === g.id ? 'rgba(124,58,237,.25)' : 'rgba(124,58,237,.15)',
              }}
            >
              {joining === g.id ? (
                <ActivityIndicator size="small" color="#A78BFA" />
              ) : (
                <OrbitronText weight="800" style={{ fontSize: 10, color: '#A78BFA' }}>ENTRAR</OrbitronText>
              )}
            </PressableScale>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}
