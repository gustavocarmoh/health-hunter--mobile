import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrbitronText } from './Typography';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { TOAST_KIND_CONFIG } from '../state/stateConfig';

export default function Toast() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { toast } = useAppState();
  const anim = useRef(new Animated.Value(0)).current;
  const lastNonce = useRef<number | null>(null);

  useEffect(() => {
    if (toast && toast.nonce !== lastNonce.current) {
      lastNonce.current = toast.nonce;
      anim.setValue(0);
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 10 }).start();
    }
  }, [toast, anim]);

  if (!toast) return null;

  const { color, emoji } = TOAST_KIND_CONFIG[toast.kind];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          top: insets.top + 16,
          backgroundColor: colors.bg1,
          borderColor: color,
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) },
            { scale: anim.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0.85, 1.08, 1] }) },
          ],
        },
      ]}
    >
      <OrbitronText weight="700" style={{ fontSize: 12, color }}>
        {emoji}
        {toast.message}
      </OrbitronText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: '50%',
    marginLeft: -140,
    width: 280,
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
