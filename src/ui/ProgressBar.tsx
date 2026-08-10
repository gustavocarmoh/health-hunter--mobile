import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

interface ProgressBarProps {
  percent: number; // 0-100
  height?: number;
  colors?: [string, string];
  animated?: boolean;
  trigger?: unknown; // change this value to replay the fill animation
}

export default function ProgressBar({ percent, height = 6, colors = ['#7C3AED', '#A78BFA'], animated = true, trigger }: ProgressBarProps) {
  const { colors: theme } = useTheme();
  const width = useRef(new Animated.Value(animated ? 0 : percent)).current;

  useEffect(() => {
    if (!animated) {
      width.setValue(percent);
      return;
    }
    width.setValue(0);
    Animated.timing(width, {
      toValue: percent,
      duration: 1100,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent, trigger]);

  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: theme.border, overflow: 'hidden' }}>
      <Animated.View
        style={{
          height: '100%',
          borderRadius: height / 2,
          overflow: 'hidden',
          width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp' }),
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, minWidth: percent > 0 ? height : 0 }}
        />
      </Animated.View>
    </View>
  );
}
