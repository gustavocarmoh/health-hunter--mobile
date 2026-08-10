import React, { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ToggleSwitch({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [value, anim]);

  return (
    <Pressable onPress={onToggle}>
      <Animated.View
        style={{
          width: 46,
          height: 26,
          borderRadius: 13,
          justifyContent: 'center',
          backgroundColor: anim.interpolate({ inputRange: [0, 1], outputRange: [colors.border, '#7C3AED'] }),
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: 3,
            left: anim.interpolate({ inputRange: [0, 1], outputRange: [3, 23] }),
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
