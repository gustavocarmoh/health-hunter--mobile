import React, { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PressableScale from '../ui/PressableScale';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import { CloseIcon } from '../ui/Icons';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { Mission } from '../state/types';

const QUICK_AMOUNTS_ML = [200, 300, 500];

export default function HydrationModal({
  mission,
  onClose,
}: {
  /** Missão HYDRATION sendo registrada, ou null quando o modal está fechado. */
  mission: Mission | null;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { logHydration } = useAppState();
  const [customMl, setCustomMl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setCustomMl('');
    onClose();
  };

  const submit = async (amountMl: number) => {
    if (!mission || submitting) return;
    setSubmitting(true);
    try {
      await logHydration(mission.id, amountMl);
      close();
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = mission?.target_amount_ml
    ? Math.max(0, mission.target_amount_ml - mission.current_amount_ml)
    : null;

  return (
    <Modal transparent animationType="slide" visible={!!mission} onRequestClose={close}>
      <Pressable onPress={close} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.6)', justifyContent: 'flex-end' }}>
        <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: colors.bg1, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingTop: 24, paddingBottom: 24 + insets.bottom, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <OrbitronText weight="700" style={{ fontSize: 14, letterSpacing: 1, color: colors.text }}>💧 HIDRATAÇÃO</OrbitronText>
            <PressableScale onPress={close} scaleTo={0.85} style={{ padding: 4 }}>
              <CloseIcon color={colors.dim} />
            </PressableScale>
          </View>

          {mission && (
            <RajdhaniText style={{ fontSize: 13, color: colors.muted }}>
              {mission.current_amount_ml}mL de {mission.target_amount_ml}mL
              {remaining ? ` — faltam ${remaining}mL` : ''}
            </RajdhaniText>
          )}

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {QUICK_AMOUNTS_ML.map((amount) => (
              <PressableScale
                key={amount}
                onPress={() => submit(amount)}
                disabled={submitting}
                scaleTo={0.95}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#38BDF8',
                  backgroundColor: 'rgba(56,189,248,.12)',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                <OrbitronText weight="700" style={{ fontSize: 14, color: '#38BDF8' }}>+{amount}</OrbitronText>
                <RajdhaniText style={{ fontSize: 10, color: colors.dim }}>mL</RajdhaniText>
              </PressableScale>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput
              placeholder="Outra quantidade (mL)"
              placeholderTextColor={colors.dim}
              keyboardType="number-pad"
              value={customMl}
              onChangeText={setCustomMl}
              style={{
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.bg0,
                color: colors.text,
                fontSize: 15,
                fontFamily: 'Rajdhani_400Regular',
              }}
            />
            <PressableScale
              onPress={() => {
                const parsed = parseInt(customMl, 10);
                if (!Number.isNaN(parsed) && parsed > 0) submit(parsed);
              }}
              disabled={submitting || !customMl.trim()}
              scaleTo={0.95}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 18,
                borderRadius: 8,
                backgroundColor: '#38BDF8',
                opacity: submitting || !customMl.trim() ? 0.5 : 1,
              }}
            >
              <Text style={{ color: '#fff', fontFamily: 'Rajdhani_700Bold', fontSize: 14 }}>OK</Text>
            </PressableScale>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
