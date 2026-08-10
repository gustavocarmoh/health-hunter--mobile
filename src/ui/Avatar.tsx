import React from 'react';
import { View } from 'react-native';
import { OrbitronText } from './Typography';

export default function Avatar({ initial, size = 56, bg = '#7C3AED', fontSize = 22 }: { initial: string; size?: number; bg?: string; fontSize?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <OrbitronText weight="800" style={{ fontSize, color: '#fff' }}>
        {initial}
      </OrbitronText>
    </View>
  );
}
