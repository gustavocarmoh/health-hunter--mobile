import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenListContainer from '../ui/ScreenListContainer';
import { SectionLabel, OrbitronText, RajdhaniText } from '../ui/Typography';
import ProgressBar from '../ui/ProgressBar';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { RARITY_CONFIG } from '../state/stateConfig';
import { Achievement } from '../state/types';

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const { achievements } = useAppState();
  const [loading, setLoading] = useState(false);
  const [animTrigger, setAnimTrigger] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const t1 = setTimeout(() => setLoading(false), 700);
      const t2 = setTimeout(() => setAnimTrigger((n) => n + 1), 150);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }, [])
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const percent = Math.round((unlockedCount / achievements.length) * 100);

  const header = (
    <>
      <SectionLabel color={colors.dim} style={{ marginBottom: 16 }}>ACHIEVEMENTS</SectionLabel>

      <View style={{ backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16, marginBottom: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <OrbitronText weight="800" style={{ fontSize: 16, color: colors.text }}>{unlockedCount}/{achievements.length}</OrbitronText>
          {loading ? <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>sincronizando…</RajdhaniText> : null}
        </View>
        <ProgressBar percent={percent} colors={['#7C3AED', '#FBBF24']} trigger={animTrigger} />
      </View>
    </>
  );

  return (
    <ScreenListContainer<Achievement>
      header={header}
      data={achievements}
      keyExtractor={(a) => String(a.id)}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={({ item: a }) => {
        const rc = RARITY_CONFIG[a.rarity];
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: colors.bg1,
              borderRadius: 12,
              padding: 14,
              gap: 6,
              opacity: a.unlocked ? 1 : 0.5,
              borderWidth: 1,
              borderColor: a.unlocked ? 'rgba(124,58,237,.35)' : colors.border,
            }}
          >
            <Text style={{ fontSize: 26 }}>{a.icon}</Text>
            <RajdhaniText weight="700" style={{ fontSize: 13, color: colors.text }}>{a.name}</RajdhaniText>
            <RajdhaniText style={{ fontSize: 11, color: colors.muted, lineHeight: 15, minHeight: 30 }}>
              {a.unlocked ? a.desc : `🔒 ${a.desc}`}
            </RajdhaniText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <View style={{ backgroundColor: rc.bg, borderRadius: 5, paddingVertical: 2, paddingHorizontal: 7 }}>
                <OrbitronText weight="800" style={{ fontSize: 9, color: rc.color }}>{a.rarity}</OrbitronText>
              </View>
              <RajdhaniText style={{ fontSize: 10, color: colors.dim }}>+{a.xp}</RajdhaniText>
            </View>
          </View>
        );
      }}
    />
  );
}
