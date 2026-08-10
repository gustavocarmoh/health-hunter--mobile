import React, { useState } from 'react'
import { View, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ScreenContainer from '../ui/ScreenContainer'
import ScreenHeader from '../ui/ScreenHeader'
import { OrbitronText, RajdhaniText } from '../ui/Typography'
import PressableScale from '../ui/PressableScale'
import { useTheme } from '../theme/ThemeContext'
import { useAppState } from '../state/AppStateContext'
import { RootStackParamList } from '../navigation/types'
import { getErrorMessage } from '../api/errors'
import activitiesApi from '../api/activities'

type Props = NativeStackScreenProps<RootStackParamList, 'AddActivity'>

const EXERCISE_TYPES = [
  'Corrida',
  'Caminhada',
  'Ciclismo',
  'Natação',
  'Musculação',
  'HIIT',
  'Yoga',
  'Dança',
  'Esportes',
  'Outro',
]

export default function AddActivityScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { showToast } = useAppState()

  const [exerciseType, setExerciseType] = useState(EXERCISE_TYPES[0])
  const [distanceKm, setDistanceKm] = useState('')
  const [durationMin, setDurationMin] = useState('')
  const [bpmAvg, setBpmAvg] = useState('')
  const [latitude, setLatitude] = useState('-23.5505')
  const [longitude, setLongitude] = useState('-46.6333')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!distanceKm.trim() || !durationMin.trim() || !bpmAvg.trim()) {
      showToast('Preencha todos os campos obrigatórios', 'error')
      return
    }

    setLoading(true)
    try {
      const distanceMeter = parseFloat(distanceKm) * 1000
      const durationSeconds = parseInt(durationMin) * 60
      const bpm = parseInt(bpmAvg)

      if (distanceMeter <= 0 || durationSeconds < 60 || bpm < 30 || bpm > 220) {
        showToast('Valores inválidos. Verifique os limites.', 'error')
        setLoading(false)
        return
      }

      await activitiesApi.logActivity({
        distancia_m: distanceMeter,
        duracao_seg: durationSeconds,
        tipo_exercicio: exerciseType,
        coordenadas_gps: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        bpm_medio: bpm,
      })

      showToast('✨ Atividade registrada com sucesso!')
      navigation.goBack()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bg0 }}
    >
      <ScreenContainer withTabBarPadding={false}>
        <ScreenHeader title="REGISTRAR ATIVIDADE" />

        <ScrollView showsVerticalScrollIndicator={false} style={{ gap: 20 }}>
          {/* Exercise Type Selector */}
          <View style={{ gap: 8 }}>
            <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
              TIPO DE EXERCÍCIO
            </RajdhaniText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ gap: 8 }}
              contentContainerStyle={{ gap: 8, paddingRight: 16 }}
            >
              {EXERCISE_TYPES.map((type) => (
                <PressableScale
                  key={type}
                  onPress={() => setExerciseType(type)}
                  scaleTo={0.95}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    backgroundColor: exerciseType === type ? '#7C3AED' : colors.bg1,
                    borderWidth: 1,
                    borderColor: exerciseType === type ? '#7C3AED' : colors.border,
                    minWidth: 100,
                    alignItems: 'center',
                  }}
                >
                  <RajdhaniText
                    weight="700"
                    style={{
                      fontSize: 12,
                      color: exerciseType === type ? '#fff' : colors.text,
                    }}
                  >
                    {type}
                  </RajdhaniText>
                </PressableScale>
              ))}
            </ScrollView>
          </View>

          {/* Distância */}
          <View style={{ gap: 6 }}>
            <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
              DISTÂNCIA (KM)
            </RajdhaniText>
            <TextInput
              placeholder="Ex: 5.5"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              value={distanceKm}
              onChangeText={setDistanceKm}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.bg1,
                color: colors.text,
                fontSize: 14,
                fontFamily: 'Rajdhani_400Regular',
              }}
            />
            <RajdhaniText style={{ fontSize: 11, color: colors.muted }}>Mínimo 0.1 km, máximo 200 km</RajdhaniText>
          </View>

          {/* Duração */}
          <View style={{ gap: 6 }}>
            <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
              DURAÇÃO (MINUTOS)
            </RajdhaniText>
            <TextInput
              placeholder="Ex: 30"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              value={durationMin}
              onChangeText={setDurationMin}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.bg1,
                color: colors.text,
                fontSize: 14,
                fontFamily: 'Rajdhani_400Regular',
              }}
            />
            <RajdhaniText style={{ fontSize: 11, color: colors.muted }}>Mínimo 1 minuto, máximo 24 horas</RajdhaniText>
          </View>

          {/* BPM Médio */}
          <View style={{ gap: 6 }}>
            <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
              BPM MÉDIO
            </RajdhaniText>
            <TextInput
              placeholder="Ex: 145"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              value={bpmAvg}
              onChangeText={setBpmAvg}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.bg1,
                color: colors.text,
                fontSize: 14,
                fontFamily: 'Rajdhani_400Regular',
              }}
            />
            <RajdhaniText style={{ fontSize: 11, color: colors.muted }}>Entre 30 e 220 BPM</RajdhaniText>
          </View>

          {/* Coordenadas GPS (hidden, preenchidas com default) */}
          <View style={{ gap: 6 }}>
            <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
              LOCALIZAÇÃO GPS
            </RajdhaniText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Latitude"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  value={latitude}
                  onChangeText={setLatitude}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.bg1,
                    color: colors.text,
                    fontSize: 13,
                    fontFamily: 'Rajdhani_400Regular',
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Longitude"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  value={longitude}
                  onChangeText={setLongitude}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.bg1,
                    color: colors.text,
                    fontSize: 13,
                    fontFamily: 'Rajdhani_400Regular',
                  }}
                />
              </View>
            </View>
            <RajdhaniText style={{ fontSize: 11, color: colors.muted }}>
              São Paulo por padrão. Editável se tiver GPS.
            </RajdhaniText>
          </View>

          {/* Submit Button */}
          <PressableScale
            onPress={handleSubmit}
            disabled={loading}
            scaleTo={0.98}
            style={{
              paddingVertical: 14,
              borderRadius: 8,
              backgroundColor: loading ? 'rgba(124, 58, 237, 0.5)' : '#7C3AED',
              alignItems: 'center',
              marginTop: 8,
              marginBottom: 40,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <OrbitronText weight="800" style={{ fontSize: 13, color: '#fff', letterSpacing: 1 }}>
                REGISTRAR ATIVIDADE
              </OrbitronText>
            )}
          </PressableScale>
        </ScrollView>
      </ScreenContainer>
    </KeyboardAvoidingView>
  )
}
