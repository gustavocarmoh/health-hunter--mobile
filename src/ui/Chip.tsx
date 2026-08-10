import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import PressableScale from './PressableScale';
import { OrbitronText } from './Typography';

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  activeBg: string;
  activeColor: string;
  activeBorder: string;
  inactiveColor: string;
  inactiveBorder: string;
  style?: StyleProp<ViewStyle>;
  flex?: boolean;
}

export default function Chip({ label, active, onPress, activeBg, activeColor, activeBorder, inactiveColor, inactiveBorder, style, flex }: ChipProps) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.93}
      style={[
        {
          flex: flex ? 1 : undefined,
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: active ? activeBorder : inactiveBorder,
          backgroundColor: active ? activeBg : 'transparent',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <OrbitronText weight="700" style={{ fontSize: 11, color: active ? activeColor : inactiveColor }}>
        {label}
      </OrbitronText>
    </PressableScale>
  );
}
