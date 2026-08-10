import * as Haptics from 'expo-haptics';

export function xpHaptic(enabled: boolean) {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function levelUpHaptic(enabled: boolean) {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function unlockHaptic(enabled: boolean) {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function tapHaptic(enabled: boolean) {
  if (!enabled) return;
  Haptics.selectionAsync().catch(() => {});
}
