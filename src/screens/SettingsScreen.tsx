import React from 'react';
import { Text, View } from 'react-native';
import ScreenContainer from '../ui/ScreenContainer';
import ScreenHeader from '../ui/ScreenHeader';
import { SectionLabel, OrbitronText, RajdhaniText } from '../ui/Typography';
import ToggleSwitch from '../ui/ToggleSwitch';
import PressableScale from '../ui/PressableScale';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';

const NOTIF_PREVIEWS = (streak: number) => [
  { icon: '🏆', time: 'agora', title: 'Conquista desbloqueada!', body: 'Você desbloqueou "Rank C Alcançado" (+150 XP)' },
  { icon: '⏰', time: '2h', title: 'Lembrete de missão', body: '"Corrida 5km" ainda não foi concluída hoje' },
  { icon: '🔥', time: '5h', title: 'Sua sequência está em risco', body: `Complete 1 missão para manter seu streak de ${streak} dias` },
];

function SettingsRow({ title, subtitle, value, onToggle, last }: { title: string; subtitle: string; value: boolean; onToggle: () => void; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.bg1,
        padding: 16,
        borderRadius: last ? 0 : 0,
      }}
    >
      <View>
        <RajdhaniText weight="600" style={{ fontSize: 14, color: colors.text }}>{title}</RajdhaniText>
        <RajdhaniText style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{subtitle}</RajdhaniText>
      </View>
      <ToggleSwitch value={value} onToggle={onToggle} />
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, mode, toggleTheme } = useTheme();
  const {
    soundEnabled, toggleSound, hapticsEnabled, toggleHaptics,
    notificationsEnabled, toggleNotifications, user, startOnboarding,
  } = useAppState();

  const previews = NOTIF_PREVIEWS(user.streak);

  return (
    <ScreenContainer>
      <ScreenHeader title="SETTINGS" />

      <SectionLabel color={colors.dim} style={{ fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>PREFERENCES</SectionLabel>
      <View style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <SettingsRow title="Tema" subtitle={mode === 'dark' ? 'Escuro' : 'Claro'} value={mode === 'dark'} onToggle={toggleTheme} />
        <View style={{ height: 1, backgroundColor: colors.bg0 }} />
        <SettingsRow title="Efeitos sonoros" subtitle="Toca um som ao ganhar XP" value={soundEnabled} onToggle={toggleSound} />
        <View style={{ height: 1, backgroundColor: colors.bg0 }} />
        <SettingsRow title="Vibração" subtitle="Feedback tátil ao concluir missões" value={hapticsEnabled} onToggle={toggleHaptics} last />
      </View>

      <SectionLabel color={colors.dim} style={{ fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>NOTIFICAÇÕES</SectionLabel>
      <View style={{ backgroundColor: colors.bg1, borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <RajdhaniText weight="600" style={{ fontSize: 14, color: colors.text }}>Ativar notificações</RajdhaniText>
            <RajdhaniText style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Missões, conquistas e streak via push</RajdhaniText>
          </View>
          <ToggleSwitch value={notificationsEnabled} onToggle={toggleNotifications} />
        </View>
      </View>

      {notificationsEnabled ? (
        <View style={{ gap: 8, marginBottom: 24 }}>
          {previews.map((np, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10, backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 15 }}>{np.icon}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <OrbitronText weight="700" style={{ fontSize: 9, letterSpacing: 0.5, color: colors.dim }}>SOLO LEVELING</OrbitronText>
                  <RajdhaniText style={{ fontSize: 10, color: colors.dim }}>{np.time}</RajdhaniText>
                </View>
                <RajdhaniText weight="700" style={{ fontSize: 13, color: colors.text, marginTop: 2 }}>{np.title}</RajdhaniText>
                <RajdhaniText style={{ fontSize: 12, color: colors.muted, marginTop: 1, lineHeight: 16 }}>{np.body}</RajdhaniText>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <SectionLabel color={colors.dim} style={{ fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>SOBRE</SectionLabel>
      <View style={{ backgroundColor: colors.bg1, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
        <RajdhaniText style={{ fontSize: 13, color: colors.muted }}>Versão</RajdhaniText>
        <RajdhaniText style={{ fontSize: 13, color: colors.text }}>1.0.0 (Entrega 2)</RajdhaniText>
      </View>

      <PressableScale
        onPress={startOnboarding}
        scaleTo={0.97}
        style={{ marginTop: 14, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg1, alignItems: 'center' }}
      >
        <OrbitronText weight="700" style={{ fontSize: 11, color: colors.text }}>REVER TUTORIAL</OrbitronText>
      </PressableScale>
    </ScreenContainer>
  );
}
