import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PressableScale from '../ui/PressableScale';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import { CloseIcon } from '../ui/Icons';
import { useTheme } from '../theme/ThemeContext';
import { CATEGORIES, CATEGORY_CONFIG, DIFFICULTIES, DIFFICULTY_CONFIG } from '../state/stateConfig';
import { useAppState } from '../state/AppStateContext';
import { Category, Difficulty } from '../state/types';

export default function CreateMissionModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { addMission } = useAppState();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('CUSTOM');
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');

  const xpPreview = DIFFICULTY_CONFIG[difficulty].xp;

  const close = () => {
    setName('');
    setCategory('CUSTOM');
    setDifficulty('EASY');
    onClose();
  };

  const submit = () => {
    if (!name.trim()) return;
    addMission({ name, category, difficulty });
    close();
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={close}>
      <Pressable onPress={close} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.6)', justifyContent: 'flex-end' }}>
        <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: colors.bg1, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingTop: 24, paddingBottom: 24 + insets.bottom, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <OrbitronText weight="700" style={{ fontSize: 14, letterSpacing: 1, color: colors.text }}>NOVA MISSÃO</OrbitronText>
            <PressableScale onPress={close} scaleTo={0.85} style={{ padding: 4 }}>
              <CloseIcon color={colors.dim} />
            </PressableScale>
          </View>

          <TextInput
            placeholder="Nome da missão"
            placeholderTextColor={colors.dim}
            value={name}
            onChangeText={setName}
            style={{
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

          <View>
            <OrbitronText weight="600" style={{ fontSize: 11, color: colors.dim, letterSpacing: 1, marginBottom: 8 }}>CATEGORIA</OrbitronText>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map((c) => {
                const active = category === c;
                const cc = CATEGORY_CONFIG[c].color;
                return (
                  <PressableScale
                    key={c}
                    onPress={() => setCategory(c)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: active ? cc : colors.border,
                      backgroundColor: active ? cc + '33' : 'transparent',
                    }}
                  >
                    <OrbitronText weight="700" style={{ fontSize: 11, color: active ? cc : colors.muted }}>{c}</OrbitronText>
                  </PressableScale>
                );
              })}
            </View>
          </View>

          <View>
            <OrbitronText weight="600" style={{ fontSize: 11, color: colors.dim, letterSpacing: 1, marginBottom: 8 }}>DIFICULDADE</OrbitronText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {DIFFICULTIES.map((d) => {
                const active = difficulty === d;
                const dc = DIFFICULTY_CONFIG[d];
                return (
                  <PressableScale
                    key={d}
                    onPress={() => setDifficulty(d)}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 10,
                      paddingHorizontal: 6,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: active ? dc.color : colors.border,
                      backgroundColor: active ? dc.bg : 'transparent',
                    }}
                  >
                    <OrbitronText weight="700" style={{ fontSize: 11, color: active ? dc.color : colors.muted }}>{d}</OrbitronText>
                  </PressableScale>
                );
              })}
            </View>
          </View>

          <RajdhaniText style={{ fontSize: 12, color: colors.muted }}>
            Recompensa: <Text style={{ color: '#FBBF24', fontWeight: '700', fontFamily: 'Rajdhani_700Bold' }}>+{xpPreview} XP</Text>
          </RajdhaniText>

          <PressableScale onPress={submit} scaleTo={0.97} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#7C3AED', paddingVertical: 14 }}>
            <OrbitronText weight="700" style={{ fontSize: 13, letterSpacing: 1, color: '#fff' }}>CRIAR MISSÃO</OrbitronText>
          </PressableScale>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
