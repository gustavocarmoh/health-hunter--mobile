import React from 'react';
import { View } from 'react-native';
import { OrbitronText, RajdhaniText } from './Typography';
import { useTheme } from '../theme/ThemeContext';

export interface StatCell {
  value: string | number;
  label: string;
  color?: string;
}

export default function StatTriple({ cells }: { cells: StatCell[] }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 1, backgroundColor: colors.border, borderRadius: 10, overflow: 'hidden' }}>
      {cells.map((cell, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: colors.bg0, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center' }}>
          <OrbitronText weight="800" style={{ fontSize: 15, color: cell.color ?? colors.text }}>
            {cell.value}
          </OrbitronText>
          <RajdhaniText style={{ fontSize: 9, color: colors.dim, marginTop: 3, letterSpacing: 0.5 }}>{cell.label}</RajdhaniText>
        </View>
      ))}
    </View>
  );
}
