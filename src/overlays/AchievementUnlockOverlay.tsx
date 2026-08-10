import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, Text, View } from 'react-native';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import { RARITY_CONFIG } from '../state/stateConfig';
import { useAppState } from '../state/AppStateContext';

export default function AchievementUnlockOverlay() {
  const { unlockedAchievement, dismissUnlockPopup } = useAppState();
  const pop = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!unlockedAchievement) return;
    pop.setValue(0);
    ring.setValue(0);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 10 }).start();
    Animated.loop(
      Animated.timing(ring, { toValue: 1, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true })
    ).start();
  }, [unlockedAchievement, pop, ring]);

  if (!unlockedAchievement) return null;
  const rc = RARITY_CONFIG[unlockedAchievement.rarity];

  return (
    <Modal transparent animationType="fade" visible={!!unlockedAchievement} onRequestClose={dismissUnlockPopup}>
      <Pressable
        onPress={dismissUnlockPopup}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.75)', alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={{ alignItems: 'center', gap: 14, padding: 32 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View
              style={{
                position: 'absolute',
                width: 110,
                height: 110,
                borderRadius: 55,
                borderWidth: 2,
                borderColor: rc.color,
                opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
                transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] }) }],
              }}
            />
            <Animated.View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: '#0F0F23',
                borderWidth: 2,
                borderColor: rc.color,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: rc.color,
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 10,
                transform: [
                  { scale: pop.interpolate({ inputRange: [0, 0.5, 0.75, 1], outputRange: [0.4, 1.12, 0.96, 1] }) },
                  {
                    rotate: pop.interpolate({ inputRange: [0, 0.5, 0.75, 1], outputRange: ['-8deg', '3deg', '-1deg', '0deg'] }),
                  },
                ],
              }}
            >
              <Text style={{ fontSize: 44 }}>{unlockedAchievement.icon}</Text>
            </Animated.View>
          </View>
          <OrbitronText weight="700" style={{ fontSize: 11, letterSpacing: 3, color: '#5A5A80' }}>ACHIEVEMENT UNLOCKED</OrbitronText>
          <OrbitronText weight="800" style={{ fontSize: 20, color: '#E8E8FF', textAlign: 'center' }}>{unlockedAchievement.name}</OrbitronText>
          <View style={{ backgroundColor: rc.bg, borderRadius: 6, paddingVertical: 3, paddingHorizontal: 10 }}>
            <OrbitronText weight="800" style={{ fontSize: 10, color: rc.color }}>
              {unlockedAchievement.rarity} · +{unlockedAchievement.xp} XP
            </OrbitronText>
          </View>
          <RajdhaniText style={{ fontSize: 11, color: '#5A5A80', marginTop: 8 }}>toque para fechar</RajdhaniText>
        </View>
      </Pressable>
    </Modal>
  );
}
