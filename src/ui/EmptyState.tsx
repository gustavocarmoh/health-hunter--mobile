import React from 'react';
import { View } from 'react-native';
import { RajdhaniText } from './Typography';
import { EmptyMissionsIcon } from './Icons';
import { useTheme } from '../theme/ThemeContext';

export default function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 10, paddingVertical: 48, paddingHorizontal: 20 }}>
      <EmptyMissionsIcon color={colors.dim} />
      <RajdhaniText weight="600" style={{ fontSize: 14, color: colors.muted, textAlign: 'center' }}>
        {title}
      </RajdhaniText>
      <RajdhaniText style={{ fontSize: 12, color: colors.dim, textAlign: 'center', maxWidth: 220 }}>{subtitle}</RajdhaniText>
    </View>
  );
}
