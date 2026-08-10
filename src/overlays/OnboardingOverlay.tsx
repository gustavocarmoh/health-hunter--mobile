import React from 'react';
import { Modal, Text, View } from 'react-native';
import PressableScale from '../ui/PressableScale';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useAppState, ONBOARDING_STEPS } from '../state/AppStateContext';

export default function OnboardingOverlay() {
  const { colors } = useTheme();
  const { showOnboarding, onboardingStep, nextOnboarding, skipOnboarding } = useAppState();

  if (!showOnboarding) return null;
  const step = ONBOARDING_STEPS[onboardingStep];
  const isLast = onboardingStep >= ONBOARDING_STEPS.length - 1;

  return (
    <Modal transparent animationType="fade" visible={showOnboarding} onRequestClose={skipOnboarding}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.85)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View style={{ width: '100%', maxWidth: 340, backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 28, paddingHorizontal: 24, alignItems: 'center', gap: 16 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(124,58,237,.15)', borderWidth: 1, borderColor: 'rgba(124,58,237,.4)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 30 }}>{step.icon}</Text>
          </View>
          <OrbitronText weight="800" style={{ fontSize: 16, color: colors.text, textAlign: 'center' }}>{step.title}</OrbitronText>
          <RajdhaniText style={{ fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20 }}>{step.desc}</RajdhaniText>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            {ONBOARDING_STEPS.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === onboardingStep ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === onboardingStep ? '#7C3AED' : colors.border,
                }}
              />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginTop: 8 }}>
            <PressableScale onPress={skipOnboarding} scaleTo={0.96} style={{ flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
              <OrbitronText weight="700" style={{ fontSize: 11, color: colors.muted }}>PULAR</OrbitronText>
            </PressableScale>
            <PressableScale onPress={nextOnboarding} scaleTo={0.96} style={{ flex: 2, paddingVertical: 12, borderRadius: 10, backgroundColor: '#7C3AED', alignItems: 'center' }}>
              <OrbitronText weight="700" style={{ fontSize: 11, color: '#fff' }}>{isLast ? 'COMEÇAR' : 'PRÓXIMO'}</OrbitronText>
            </PressableScale>
          </View>
        </View>
      </View>
    </Modal>
  );
}
