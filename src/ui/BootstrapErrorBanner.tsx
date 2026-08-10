import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PressableScale from './PressableScale';
import { RajdhaniText, OrbitronText } from './Typography';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';

/**
 * Persistent (non-auto-dismissing) banner shown when the initial data sync with the
 * backend fails. The app still works off cached/local data — this just tells the
 * hunter their info might be stale and offers a retry.
 */
export default function BootstrapErrorBanner() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { bootstrapError, retryBootstrap } = useAppState();

  if (!bootstrapError) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(16, insets.bottom) + 74, alignItems: 'center', zIndex: 80 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          maxWidth: '90%',
          backgroundColor: colors.bg1,
          borderWidth: 1,
          borderColor: 'rgba(239,68,68,.4)',
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 14,
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <RajdhaniText style={{ flex: 1, fontSize: 12, color: colors.muted }}>{bootstrapError}</RajdhaniText>
        <PressableScale
          onPress={retryBootstrap}
          scaleTo={0.94}
          style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(239,68,68,.15)' }}
        >
          <OrbitronText weight="700" style={{ fontSize: 10, color: '#EF4444' }}>RETRY</OrbitronText>
        </PressableScale>
      </View>
    </View>
  );
}
