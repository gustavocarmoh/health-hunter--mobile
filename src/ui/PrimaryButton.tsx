import React from 'react';
import { ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import PressableScale from './PressableScale';
import { OrbitronText } from './Typography';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  bg?: string;
  color?: string;
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  disabled?: boolean;
}

export default function PrimaryButton({ label, onPress, bg = '#7C3AED', color = '#fff', borderColor, style, loading, disabled }: PrimaryButtonProps) {
  return (
    <PressableScale
      onPress={disabled ? undefined : onPress}
      scaleTo={0.96}
      style={[
        {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 10,
          backgroundColor: bg,
          borderWidth: borderColor ? 1 : 0,
          borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 44,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <OrbitronText weight="700" style={{ fontSize: 14, letterSpacing: 1, color }}>
          {label}
        </OrbitronText>
      )}
    </PressableScale>
  );
}
