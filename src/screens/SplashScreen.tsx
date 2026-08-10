import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import { TokenStorage } from '../api/tokenStorage';
import { authHandler } from '../api/authHandler';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const PARTICLE_COUNT = 20;

export default function SplashScreen({ navigation }: Props) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 4000,
        dur: 3000 + Math.random() * 3000,
        size: 2 + Math.random() * 3,
        anim: new Animated.Value(0),
      })),
    []
  );

  const goToNextScreen = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const token = await TokenStorage.getAccessToken();
    const nextRoute = token ? 'Main' : 'Landing';
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: nextRoute as any }] }));
  };

  useEffect(() => {
    // Register logout callback to return to splash on session expiration
    authHandler.registerOnUnauthorized(() => {
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Landing' }] }));
    });

    Animated.timing(fadeIn, { toValue: 1, duration: 1100, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    particles.forEach((p) => {
      const loop = () => {
        p.anim.setValue(0);
        Animated.timing(p.anim, { toValue: 1, duration: p.dur, delay: p.delay, easing: Easing.linear, useNativeDriver: true }).start(() => loop());
      };
      loop();
    });
    timerRef.current = setTimeout(goToNextScreen, 2200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable onPress={goToNextScreen} style={{ flex: 1, backgroundColor: '#05050F' }}>
      <Animated.View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', opacity: fadeIn, overflow: 'hidden' }}>
        {particles.map((p, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              bottom: 0,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: '#7C3AED',
              opacity: p.anim.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 1, 0] }),
              transform: [{ translateY: p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -420] }) }],
            }}
          />
        ))}
        <Animated.View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            borderWidth: 3,
            borderColor: '#1A1A3E',
            borderTopColor: '#7C3AED',
            marginBottom: 28,
            transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
          }}
        />
        <OrbitronText weight="700" style={{ fontSize: 13, letterSpacing: 6, color: '#A78BFA' }}>CARREGANDO</OrbitronText>
        <Animated.View style={{ position: 'absolute', bottom: 48, opacity: pulse }}>
          <RajdhaniText style={{ fontSize: 11, color: '#5A5A80', letterSpacing: 1 }}>toque para continuar</RajdhaniText>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
