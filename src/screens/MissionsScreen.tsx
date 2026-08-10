import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import ScreenListContainer from '../ui/ScreenListContainer';
import { SectionLabel, OrbitronText, RajdhaniText } from '../ui/Typography';
import Chip from '../ui/Chip';
import MissionRow from '../ui/MissionRow';
import EmptyState from '../ui/EmptyState';
import PressableScale from '../ui/PressableScale';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { CATEGORY_FILTERS, CATEGORY_FILTER_ALL, CategoryFilter } from '../state/stateConfig';
import { Mission } from '../state/types';
import CreateMissionModal from './CreateMissionModal';

export default function MissionsScreen() {
  const { colors } = useTheme();
  const { missions, toggleMission, generateDaily } = useAppState();
  const [filter, setFilter] = useState<CategoryFilter>(CATEGORY_FILTER_ALL);
  const [showModal, setShowModal] = useState(false);

  const filteredMissions = useMemo(
    () => missions.filter((m) => filter === CATEGORY_FILTER_ALL || m.category === filter),
    [missions, filter]
  );

  const header = (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', rowGap: 8, marginTop: 34, marginBottom: 16 }}>
        <SectionLabel color={colors.dim}>MISSIONS</SectionLabel>
        <PressableScale
          onPress={generateDaily}
          scaleTo={0.95}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 8,
            paddingHorizontal: 12,
            minHeight: 36,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(251,191,36,.4)',
            backgroundColor: 'rgba(251,191,36,.1)',
          }}
        >
          <OrbitronText weight="800" style={{ fontSize: 10, letterSpacing: 0.5, color: '#FBBF24' }}>✦ GENERATE DAILY</OrbitronText>
        </PressableScale>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 6 }} style={{ marginBottom: 18 }}>
        {CATEGORY_FILTERS.map((c) => (
          <Chip
            key={c}
            label={c}
            active={filter === c}
            onPress={() => setFilter(c)}
            activeBg="#7C3AED"
            activeColor="#fff"
            activeBorder="#7C3AED"
            inactiveColor="#9A9AC0"
            inactiveBorder={colors.border}
          />
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <SectionLabel color={colors.dim} style={{ fontSize: 11, letterSpacing: 2 }}>
          {filter === CATEGORY_FILTER_ALL ? 'ALL MISSIONS' : filter}
        </SectionLabel>
        <RajdhaniText style={{ fontSize: 12, color: colors.muted }}>{filteredMissions.length} missões</RajdhaniText>
      </View>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }}>
      <ScreenListContainer<Mission>
        header={header}
        data={filteredMissions}
        keyExtractor={(m) => String(m.id)}
        renderItem={({ item }) => <MissionRow mission={item} onToggle={() => toggleMission(item.id)} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <EmptyState title="Nenhuma missão por aqui" subtitle="Gere missões diárias ou crie uma missão customizada com o botão +" />
        }
      />

      {/* Manual mission creation disabled - only admins can create via backend */}
      {/* <PressableScale
        onPress={() => setShowModal(true)}
        scaleTo={0.88}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: '#7C3AED',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#7C3AED',
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 26, lineHeight: 28 }}>+</Text>
      </PressableScale>

      <CreateMissionModal visible={showModal} onClose={() => setShowModal(false)} /> */}
    </View>
  );
}
