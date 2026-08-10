import React from 'react';
import { Text, View } from 'react-native';
import PressableScale from './PressableScale';
import { CheckIcon } from './Icons';
import { OrbitronText, RajdhaniText } from './Typography';
import { useTheme } from '../theme/ThemeContext';
import { CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '../state/stateConfig';
import { Mission } from '../state/types';

export default function MissionRow({ mission, onToggle }: { mission: Mission; onToggle: () => void }) {
  const { colors } = useTheme();
  const diff = DIFFICULTY_CONFIG[mission.difficulty] || DIFFICULTY_CONFIG.EASY;
  const cat = CATEGORY_CONFIG[mission.category] || CATEGORY_CONFIG.CUSTOM;
  const catColor = cat.color;
  const done = mission.done;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.bg1,
        borderLeftWidth: 3,
        borderLeftColor: catColor,
        borderRadius: 8,
        padding: 12,
        paddingHorizontal: 14,
        opacity: done ? 0.55 : 1,
      }}
    >
      <Text style={{ fontSize: 18 }}>{mission.icon}</Text>
      <View style={{ flex: 1, minWidth: 0 }}>
        <RajdhaniText
          weight="600"
          numberOfLines={1}
          style={{
            fontSize: 14,
            color: done ? '#5A5A80' : colors.text,
            textDecorationLine: done ? 'line-through' : 'none',
          }}
        >
          {mission.name}
        </RajdhaniText>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 2 }}>
          <View style={{ backgroundColor: diff.bg, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6 }}>
            <OrbitronText weight="800" style={{ fontSize: 9, color: diff.color }}>
              {mission.difficulty}
            </OrbitronText>
          </View>
          <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>+{mission.xp} XP</RajdhaniText>
        </View>
      </View>
      <PressableScale
        onPress={onToggle}
        scaleTo={0.85}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          borderWidth: 2,
          borderColor: done ? '#22C55E' : colors.border,
          backgroundColor: done ? '#22C55E' : colors.bg1,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#22C55E',
          shadowOpacity: done ? 0.5 : 0,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 0 },
          elevation: done ? 4 : 0,
        }}
      >
        {done ? <CheckIcon color="#fff" /> : null}
      </PressableScale>
    </View>
  );
}
