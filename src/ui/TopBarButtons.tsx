import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PressableScale from './PressableScale';
import { SoundOffIcon, SoundOnIcon } from './Icons';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';

/** Fixed top-right sound + theme toggle, visible above every screen. */
export default function TopBarButtons() {
  const insets = useSafeAreaInsets();
  const { colors, mode, toggleTheme } = useTheme();
  const { soundEnabled, toggleSound } = useAppState();

  return (
    <View pointerEvents="box-none" style={[styles.container, { top: Math.max(28, insets.top) + 8 }]}>
      <PressableScale onPress={toggleSound} scaleTo={0.88} style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.bg1 }]}>
        {soundEnabled ? <SoundOnIcon color={colors.text} /> : <SoundOffIcon color={colors.text} />}
      </PressableScale>
      <PressableScale onPress={toggleTheme} scaleTo={0.88} style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.bg1 }]}>
        <Text style={{ fontSize: 16 }}>{mode === 'dark' ? '☀' : '🌙'}</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 14,
    zIndex: 60,
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
