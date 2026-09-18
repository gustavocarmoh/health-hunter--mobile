import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import ScreenContainer from '../ui/ScreenContainer';
import ScreenHeader from '../ui/ScreenHeader';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import PressableScale from '../ui/PressableScale';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { getErrorMessage } from '../api/errors';
import eventsApi, { Event } from '../api/events';

const EVENT_TYPE_LABEL: Record<Event['type'], string> = {
  RAID: 'RAID',
  CAMPAIGN: 'CAMPANHA',
};

export default function EventsScreen() {
  const { colors } = useTheme();
  const { showToast } = useAppState();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (ev: Event) => {
    setBusyId(ev.id);
    try {
      if (ev.joined) {
        await eventsApi.leave(ev.id);
        showToast('Você saiu do evento.');
      } else {
        await eventsApi.join(ev.id);
        showToast('✨ Inscrito! Missões do evento foram geradas para você.');
      }
      await load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScreenContainer withTabBarPadding={false} header={<ScreenHeader title="EVENTS" />}>
      {loading ? (
        <View style={{ paddingVertical: 60, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : events.length === 0 ? (
        <View style={{ paddingVertical: 60, alignItems: 'center', gap: 8 }}>
          <RajdhaniText style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>
            Nenhum evento ativo no momento.
          </RajdhaniText>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {events.map((ev) => {
            const busy = busyId === ev.id;
            const endsAt = new Date(ev.ends_at);
            return (
              <View key={ev.id} style={{ backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <RajdhaniText weight="700" style={{ flex: 1, fontSize: 15, color: colors.text }}>{ev.title}</RajdhaniText>
                  <View style={{ backgroundColor: 'rgba(0,245,255,.12)', borderRadius: 5, paddingVertical: 3, paddingHorizontal: 8 }}>
                    <OrbitronText weight="800" style={{ fontSize: 9, color: '#00F5FF' }}>{EVENT_TYPE_LABEL[ev.type]}</OrbitronText>
                  </View>
                </View>
                <RajdhaniText style={{ fontSize: 12, color: colors.muted, lineHeight: 18 }}>{ev.description}</RajdhaniText>
                <RajdhaniText style={{ fontSize: 10, color: colors.dim }}>
                  Encerra em {endsAt.toLocaleDateString()} às {endsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </RajdhaniText>
                {ev.joined && (
                  <RajdhaniText style={{ fontSize: 11, color: '#A78BFA' }}>
                    🎯 {ev.mission_count} {ev.mission_count === 1 ? 'missão gerada' : 'missões geradas'} pra você
                  </RajdhaniText>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>
                    {ev.participant_count} {ev.participant_count === 1 ? 'caçador participando' : 'caçadores participando'}
                  </RajdhaniText>
                  <PressableScale
                    onPress={() => handleToggle(ev)}
                    disabled={busy}
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
                      opacity: busy ? 0.6 : 1,
                    }}
                  >
                    {busy ? (
                      <ActivityIndicator size="small" color={ev.joined ? '#22C55E' : '#A78BFA'} />
                    ) : (
                      <OrbitronText weight="800" style={{ fontSize: 10, color: ev.joined ? '#22C55E' : '#A78BFA' }}>
                        {ev.joined ? 'INSCRITO' : 'PARTICIPAR'}
                      </OrbitronText>
                    )}
                  </PressableScale>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
}
