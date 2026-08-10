import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PressableScale from './PressableScale';
import { SectionLabel } from './Typography';
import { BackIcon } from './Icons';
import { useTheme } from '../theme/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

/** Matches the back-chevron + tracked-out title row used on every non-tab screen.
 * Includes top margin so it clears the fixed sound/theme buttons in the corner. */
export default function ScreenHeader({ title, onBack, action }: ScreenHeaderProps) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const handleBack = onBack ?? (() => navigation.goBack());

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 34, marginBottom: 20 }}>
      <PressableScale onPress={handleBack} scaleTo={0.85} style={{ padding: 4 }}>
        <BackIcon color={colors.text} />
      </PressableScale>
      <SectionLabel color={colors.dim}>{title}</SectionLabel>
      {action && <View style={{ marginLeft: 'auto' }}>{action}</View>}
    </View>
  );
}
