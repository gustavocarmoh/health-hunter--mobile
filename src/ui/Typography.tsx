import React from 'react';
import { Text, TextProps } from 'react-native';
import { fonts } from '../theme/fonts';

/** Orbitron — used for headers, labels, badges, buttons throughout the design. */
export function OrbitronText({ style, weight = '700', ...rest }: TextProps & { weight?: '600' | '700' | '800' | '900' }) {
  const family = { '600': fonts.orbitron600, '700': fonts.orbitron700, '800': fonts.orbitron800, '900': fonts.orbitron900 }[weight];
  return <Text style={[{ fontFamily: family }, style]} {...rest} />;
}

/** Rajdhani — used for body copy. */
export function RajdhaniText({ style, weight = '400', ...rest }: TextProps & { weight?: '400' | '500' | '600' | '700' }) {
  const family = { '400': fonts.rajdhani400, '500': fonts.rajdhani500, '600': fonts.rajdhani600, '700': fonts.rajdhani700 }[weight];
  return <Text style={[{ fontFamily: family }, style]} {...rest} />;
}

/** Section eyebrow label, e.g. "DASHBOARD" / "EXPLORE" — Orbitron, wide letter-spacing, dim color. */
export function SectionLabel({ children, color, style }: { children: React.ReactNode; color: string; style?: TextProps['style'] }) {
  return (
    <OrbitronText weight="700" style={[{ fontSize: 12, letterSpacing: 4, color }, style]}>
      {children}
    </OrbitronText>
  );
}
