import React from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import GradientText from '../ui/GradientText';
import PrimaryButton from '../ui/PrimaryButton';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export default function LandingScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0, alignItems: 'center', justifyContent: 'center', gap: 32, padding: 32, paddingTop: insets.top + 32 }}>
      <View style={{ alignItems: 'center' }}>
        <GradientText colors={['#A78BFA', '#00F5FF']} weight="900" style={{ fontSize: 38, lineHeight: 42, textAlign: 'center', letterSpacing: 1 }}>
          SOLO{'\n'}LEVELING
        </GradientText>
        <OrbitronText weight="700" style={{ fontSize: 13, letterSpacing: 5, color: colors.dim, marginTop: 4 }}>
          LIFESTYLE
        </OrbitronText>
      </View>
      <RajdhaniText style={{ fontSize: 15, lineHeight: 24, textAlign: 'center', color: colors.muted, maxWidth: 300 }}>
        Transforme hábitos diários em uma jornada de evolução. Ganhe XP, suba de rank e torne-se o Hunter que você deveria ser.
      </RajdhaniText>
      <View style={{ gap: 14, width: '100%', maxWidth: 300 }}>
        <PrimaryButton label="LOGIN" bg="#7C3AED" color="#fff" onPress={() => navigation.navigate('Login')} />
        <PrimaryButton label="CREATE ACCOUNT" bg="#00F5FF" color="#05050F" onPress={() => navigation.navigate('Register')} />
      </View>
    </View>
  );
}
