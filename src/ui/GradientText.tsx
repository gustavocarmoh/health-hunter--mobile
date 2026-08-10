import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { OrbitronText } from './Typography';

interface GradientTextProps {
  children: React.ReactNode;
  colors: [string, string];
  style?: StyleProp<TextStyle>;
  weight?: '600' | '700' | '800' | '900';
}

/** Approximates the prototype's `background-clip:text` gradient headline. */
export default function GradientText({ children, colors, style, weight = '900' }: GradientTextProps) {
  return (
    <MaskedView maskElement={<OrbitronText weight={weight} style={style}>{children}</OrbitronText>}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <OrbitronText weight={weight} style={[style, { opacity: 0 }]}>
          {children}
        </OrbitronText>
      </LinearGradient>
    </MaskedView>
  );
}
