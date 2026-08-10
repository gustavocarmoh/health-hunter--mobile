import React from 'react';
import { View } from 'react-native';
import ScreenContainer from '../ui/ScreenContainer';
import ScreenHeader from '../ui/ScreenHeader';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import PressableScale from '../ui/PressableScale';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';

export default function EventsScreen() {
  const { colors } = useTheme();
  const { events, toggleEvent } = useAppState();

  return (
    <ScreenContainer withTabBarPadding={false} header={<ScreenHeader title="EVENTS" />}>
      <View style={{ gap: 12 }}>
        {events.map((ev) => (
          <View key={ev.id} style={{ backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <RajdhaniText weight="700" style={{ flex: 1, fontSize: 15, color: colors.text }}>{ev.name}</RajdhaniText>
              <View style={{ backgroundColor: 'rgba(0,245,255,.12)', borderRadius: 5, paddingVertical: 3, paddingHorizontal: 8 }}>
                <OrbitronText weight="800" style={{ fontSize: 9, color: '#00F5FF' }}>{ev.dateLabel}</OrbitronText>
              </View>
            </View>
            <RajdhaniText style={{ fontSize: 12, color: colors.muted, lineHeight: 18 }}>{ev.desc}</RajdhaniText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>{ev.participants} caçadores participando</RajdhaniText>
              <PressableScale
                onPress={() => toggleEvent(ev.id)}
                scaleTo={0.95}
                style={{
                  minHeight: 32,
                  justifyContent: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: ev.joined ? 'rgba(34,197,94,.4)' : 'rgba(124,58,237,.4)',
                  backgroundColor: ev.joined ? 'rgba(34,197,94,.12)' : 'rgba(124,58,237,.15)',
                }}
              >
                <OrbitronText weight="800" style={{ fontSize: 10, color: ev.joined ? '#22C55E' : '#A78BFA' }}>
                  {ev.joined ? 'INSCRITO' : 'PARTICIPAR'}
                </OrbitronText>
              </PressableScale>
            </View>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}
