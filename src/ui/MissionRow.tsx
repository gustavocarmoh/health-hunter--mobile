import React, { useState } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import PressableScale from './PressableScale';
import { CheckIcon } from './Icons';
import { OrbitronText, RajdhaniText } from './Typography';
import { useTheme } from '../theme/ThemeContext';
import { CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '../state/stateConfig';
import { Mission } from '../state/types';

export default function MissionRow({
  mission,
  onToggle,
  onStart,
  onHydrate,
}: {
  mission: Mission;
  onToggle: () => Promise<void>;
  /** Chamado em vez de onToggle quando a missão é GPS_DISTANCE/DURATION e ainda não foi
   * concluída — deve levar o usuário para "Iniciar Atividade" em vez de marcar o check direto. */
  onStart: () => void;
  /** Chamado em vez de onToggle quando a missão é HYDRATION e ainda não foi concluída — deve
   * abrir o registro de mL bebidos. */
  onHydrate: () => void;
}) {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const diff = DIFFICULTY_CONFIG[mission.difficulty] || DIFFICULTY_CONFIG.EASY;
  const cat = CATEGORY_CONFIG[mission.category] || CATEGORY_CONFIG.CUSTOM;
  const catColor = cat.color;
  const done = mission.done;
  const needsActivity = mission.validation_type === 'GPS_DISTANCE' || mission.validation_type === 'DURATION';
  const isHydration = mission.validation_type === 'HYDRATION';

  const handlePress = async () => {
    // Concluída: ainda permite desmarcar via toggle (sempre liberado, qualquer tipo).
    // Não concluída + precisa de atividade: manda pro fluxo de "Iniciar Atividade".
    // Não concluída + hidratação: abre o registro de mL.
    if (!done && needsActivity) {
      onStart();
      return;
    }
    if (!done && isHydration) {
      onHydrate();
      return;
    }
    setIsLoading(true);
    try {
      await onToggle();
    } finally {
      setIsLoading(false);
    }
  };

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
          {isHydration && !done && mission.target_amount_ml && (
            <RajdhaniText style={{ fontSize: 11, color: '#38BDF8' }}>
              💧 {mission.current_amount_ml}/{mission.target_amount_ml}mL
            </RajdhaniText>
          )}
        </View>
      </View>
      <PressableScale
        onPress={handlePress}
        disabled={isLoading}
        scaleTo={0.85}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          borderWidth: 2,
          borderColor: done ? '#22C55E' : needsActivity ? '#7C3AED' : isHydration ? '#38BDF8' : colors.border,
          backgroundColor: done
            ? '#22C55E'
            : needsActivity
              ? 'rgba(124,58,237,.15)'
              : isHydration
                ? 'rgba(56,189,248,.15)'
                : colors.bg1,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#22C55E',
          shadowOpacity: done ? 0.5 : 0,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 0 },
          elevation: done ? 4 : 0,
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={done ? '#fff' : colors.dim} />
        ) : done ? (
          <CheckIcon color="#fff" />
        ) : needsActivity ? (
          <Text style={{ fontSize: 16, color: '#A78BFA' }}>▶</Text>
        ) : isHydration ? (
          <Text style={{ fontSize: 18 }}>💧</Text>
        ) : null}
      </PressableScale>
    </View>
  );
}
