import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, useWindowDimensions, View } from 'react-native';
import { OrbitronText } from '../ui/Typography';
import { useAppState } from '../state/AppStateContext';

const COLORS = ['#7C3AED', '#00F5FF', '#FBBF24', '#22C55E', '#EF4444', '#A78BFA'];
const PIECE_COUNT = 24;

interface Piece {
  left: number;
  delay: number;
  dur: number;
  size: number;
  color: string;
  fall: Animated.Value;
}

export default function ConfettiOverlay() {
  const { confetti } = useAppState();
  const { height: SCREEN_H } = useWindowDimensions();
  const textAnim = useRef(new Animated.Value(0)).current;
  const runningNonce = useRef<number | null>(null);

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        dur: 1.4 + Math.random() * 0.8,
        size: 6 + Math.random() * 6,
        color: COLORS[i % COLORS.length],
        fall: new Animated.Value(0),
      })),
    [confetti.nonce]
  );

  useEffect(() => {
    if (!confetti.active || confetti.nonce === runningNonce.current) return;
    runningNonce.current = confetti.nonce;
    textAnim.setValue(0);
    Animated.timing(textAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    pieces.forEach((p) => {
      p.fall.setValue(0);
      Animated.timing(p.fall, {
        toValue: 1,
        duration: p.dur * 1000,
        delay: p.delay * 1000,
        useNativeDriver: true,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confetti.active, confetti.nonce]);

  if (!confetti.active) return null;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90, overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: -20,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            borderRadius: 2,
            backgroundColor: p.color,
            opacity: p.fall.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateY: p.fall.interpolate({ inputRange: [0, 1], outputRange: [0, SCREEN_H] }) },
              { rotate: p.fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] }) },
            ],
          }}
        />
      ))}
      <Animated.View
        style={{
          position: 'absolute',
          top: '38%',
          left: 0,
          right: 0,
          alignItems: 'center',
          opacity: textAnim,
          transform: [{ scale: textAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.15, 1] }) }],
        }}
      >
        <OrbitronText weight="700" style={{ fontSize: 13, letterSpacing: 4, color: '#FBBF24' }}>LEVEL UP</OrbitronText>
        <OrbitronText
          weight="900"
          style={{
            fontSize: 40,
            color: '#fff',
            textShadowColor: 'rgba(251,191,36,.7)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 20,
          }}
        >
          {confetti.levelLabel}
        </OrbitronText>
      </Animated.View>
    </View>
  );
}
