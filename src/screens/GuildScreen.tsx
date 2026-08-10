import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../ui/ScreenContainer';
import ScreenHeader from '../ui/ScreenHeader';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import PressableScale from '../ui/PressableScale';
import ProgressBar from '../ui/ProgressBar';
import StatTriple from '../ui/StatTriple';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { fmtXp } from '../state/selectors';
import { GUILD_ROLE_CONFIG } from '../state/stateConfig';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function GuildScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { guild, guildMembers, guildQuestProgress, leaveGuild } = useAppState();
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  const questTarget = 100;
  const questPercent = guildQuestProgress;

  const onConfirmLeave = () => {
    setConfirmingLeave(false);
    leaveGuild();
    navigation.navigate('GuildBrowse');
  };

  return (
    <ScreenContainer withTabBarPadding={false}>
      <ScreenHeader title="GUILD" />

      <View style={{ backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 18, marginBottom: 20, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' }}>
            <OrbitronText weight="800" style={{ fontSize: 16, color: '#fff' }}>{guild.tag}</OrbitronText>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <OrbitronText weight="700" numberOfLines={1} style={{ fontSize: 15, color: colors.text }}>{guild.name}</OrbitronText>
            <RajdhaniText style={{ fontSize: 12, color: colors.muted }}>Nível {guild.level} · {guildMembers.length} membros</RajdhaniText>
          </View>
          <View style={{ backgroundColor: 'rgba(0,245,255,.12)', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 10 }}>
            <OrbitronText weight="800" style={{ fontSize: 11, color: '#00F5FF' }}>#{guild.globalRank}</OrbitronText>
          </View>
        </View>
        <StatTriple
          cells={[
            { value: fmtXp(guild.totalXp), label: 'GUILD XP', color: '#FBBF24' },
            { value: guild.weeklyContribution, label: 'SUA CONTRIB. (7D)' },
          ]}
        />
      </View>

      <View style={{ backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16, marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <RajdhaniText weight="700" style={{ fontSize: 14, color: colors.text }}>Missão de Guilda: Caça Coletiva</RajdhaniText>
          <RajdhaniText weight="700" style={{ fontSize: 11, color: '#FBBF24' }}>+250 XP</RajdhaniText>
        </View>
        <RajdhaniText style={{ fontSize: 12, color: colors.muted, marginBottom: 10 }}>
          Membros combinam esforços para derrotar 100 monstros temáticos esta semana.
        </RajdhaniText>
        <ProgressBar percent={questPercent} colors={['#7C3AED', '#00F5FF']} animated={false} />
        <RajdhaniText style={{ fontSize: 11, color: colors.dim, marginTop: 6 }}>{guildQuestProgress}/{questTarget} contribuições da guilda</RajdhaniText>
      </View>

      <OrbitronText weight="700" style={{ fontSize: 11, letterSpacing: 2, color: colors.dim, marginBottom: 12 }}>MEMBROS</OrbitronText>
      <View style={{ gap: 8, marginBottom: 20 }}>
        {guildMembers.map((m, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: m.isMe ? 'rgba(124,58,237,.12)' : colors.bg1,
              borderWidth: 1,
              borderColor: m.isMe ? 'rgba(124,58,237,.4)' : colors.border,
              borderRadius: 10,
              padding: 12,
            }}
          >
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: m.avatarColor, alignItems: 'center', justifyContent: 'center' }}>
              <OrbitronText weight="800" style={{ fontSize: 13, color: '#fff' }}>{m.name[0]?.toUpperCase()}</OrbitronText>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <RajdhaniText weight="600" numberOfLines={1} style={{ fontSize: 13, color: colors.text }}>{m.name}</RajdhaniText>
              <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>{GUILD_ROLE_CONFIG[m.role].label}</RajdhaniText>
            </View>
            <OrbitronText weight="700" style={{ fontSize: 11, color: '#FBBF24' }}>{fmtXp(m.xp)} XP</OrbitronText>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <PressableScale
          onPress={() => navigation.navigate('GuildBrowse')}
          scaleTo={0.97}
          style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg1, alignItems: 'center' }}
        >
          <OrbitronText weight="700" style={{ fontSize: 11, color: colors.text }}>BUSCAR GUILDAS</OrbitronText>
        </PressableScale>
        {!confirmingLeave ? (
          <PressableScale
            onPress={() => setConfirmingLeave(true)}
            scaleTo={0.97}
            style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,.4)', alignItems: 'center' }}
          >
            <OrbitronText weight="700" style={{ fontSize: 11, color: '#EF4444' }}>SAIR DA GUILDA</OrbitronText>
          </PressableScale>
        ) : (
          <PressableScale
            onPress={onConfirmLeave}
            scaleTo={0.97}
            style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center' }}
          >
            <OrbitronText weight="700" style={{ fontSize: 11, color: '#fff' }}>CONFIRMAR SAÍDA</OrbitronText>
          </PressableScale>
        )}
      </View>
    </ScreenContainer>
  );
}
