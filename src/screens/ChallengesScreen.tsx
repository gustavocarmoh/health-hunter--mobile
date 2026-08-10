import React from 'react';
import { View } from 'react-native';
import ScreenContainer from '../ui/ScreenContainer';
import ScreenHeader from '../ui/ScreenHeader';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import PressableScale from '../ui/PressableScale';
import ProgressBar from '../ui/ProgressBar';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';

export default function ChallengesScreen() {
  const { colors } = useTheme();
  const { challenges, toggleChallenge } = useAppState();

  return (
    <ScreenContainer withTabBarPadding={false} header={<ScreenHeader title="CHALLENGES" />}>
      <View style={{ gap: 12 }}>
        {challenges.map((ch) => {
          const percent = Math.round((ch.progress / ch.target) * 100);
          return (
            <View key={ch.id} style={{ backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <RajdhaniText weight="700" style={{ flex: 1, fontSize: 15, color: colors.text }}>{ch.name}</RajdhaniText>
                <RajdhaniText weight="700" style={{ fontSize: 11, color: '#FBBF24' }}>+{ch.xp} XP</RajdhaniText>
              </View>
              <RajdhaniText style={{ fontSize: 12, color: colors.muted }}>{ch.goal}</RajdhaniText>
              <ProgressBar percent={percent} colors={['#7C3AED', '#FBBF24']} animated={false} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>{ch.progress}/{ch.target}</RajdhaniText>
                <PressableScale
                  onPress={() => toggleChallenge(ch.id)}
                  scaleTo={0.95}
                  style={{
                    minHeight: 32,
                    justifyContent: 'center',
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: ch.joined ? 'rgba(239,68,68,.35)' : 'rgba(0,245,255,.35)',
                    backgroundColor: ch.joined ? 'rgba(239,68,68,.1)' : 'rgba(0,245,255,.12)',
                  }}
                >
                  <OrbitronText weight="800" style={{ fontSize: 10, color: ch.joined ? '#EF4444' : '#00F5FF' }}>
                    {ch.joined ? 'DEIXAR' : 'ENTRAR'}
                  </OrbitronText>
                </PressableScale>
              </View>
            </View>
          );
        })}
      </View>
    </ScreenContainer>
  );
}
