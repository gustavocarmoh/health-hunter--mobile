import React, { useCallback, useEffect, useState } from 'react'
import { View, TextInput, ActivityIndicator, ScrollView } from 'react-native'
import ScreenContainer from '../ui/ScreenContainer'
import ScreenHeader from '../ui/ScreenHeader'
import { OrbitronText, RajdhaniText } from '../ui/Typography'
import PressableScale from '../ui/PressableScale'
import { useTheme } from '../theme/ThemeContext'
import { useAppState } from '../state/AppStateContext'
import { getErrorMessage } from '../api/errors'
import measurementsApi, { BodyMeasurement } from '../api/measurements'

export default function BodyMeasurementsScreen() {
  const { colors } = useTheme()
  const { showToast } = useAppState()
  const [history, setHistory] = useState<BodyMeasurement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [bodyFatPct, setBodyFatPct] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { measurements } = await measurementsApi.getHistory(1, 30)
      setHistory(measurements)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async () => {
    const weight = weightKg.trim() ? parseFloat(weightKg) : undefined
    const height = heightCm.trim() ? parseFloat(heightCm) : undefined
    const bodyFat = bodyFatPct.trim() ? parseFloat(bodyFatPct) : undefined

    if (weight === undefined && height === undefined && bodyFat === undefined) {
      showToast('Preencha ao menos um campo', 'error')
      return
    }

    setSaving(true)
    try {
      await measurementsApi.log({ weight_kg: weight, height_cm: height, body_fat_pct: bodyFat })
      showToast('✨ Medida registrada!')
      setWeightKg('')
      setHeightCm('')
      setBodyFatPct('')
      await load()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg1,
    color: colors.text,
    fontSize: 14,
    fontFamily: 'Rajdhani_400Regular',
  } as const

  return (
    <ScreenContainer withTabBarPadding={false} header={<ScreenHeader title="MEDIDAS CORPORAIS" />}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 8, marginBottom: 16 }}>
          <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
            PESO (KG)
          </RajdhaniText>
          <TextInput
            placeholder="Ex: 72.5"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            value={weightKg}
            onChangeText={setWeightKg}
            style={inputStyle}
          />
        </View>

        <View style={{ gap: 8, marginBottom: 16 }}>
          <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
            ALTURA (CM)
          </RajdhaniText>
          <TextInput
            placeholder="Ex: 178"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            value={heightCm}
            onChangeText={setHeightCm}
            style={inputStyle}
          />
        </View>

        <View style={{ gap: 8, marginBottom: 20 }}>
          <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
            % DE GORDURA CORPORAL
          </RajdhaniText>
          <TextInput
            placeholder="Ex: 18.5"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            value={bodyFatPct}
            onChangeText={setBodyFatPct}
            style={inputStyle}
          />
        </View>

        <PressableScale
          onPress={handleSave}
          disabled={saving}
          scaleTo={0.98}
          style={{
            paddingVertical: 14,
            borderRadius: 8,
            backgroundColor: saving ? 'rgba(124,58,237,.5)' : '#7C3AED',
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <OrbitronText weight="800" style={{ fontSize: 13, color: '#fff', letterSpacing: 1 }}>
              REGISTRAR MEDIDA
            </OrbitronText>
          )}
        </PressableScale>

        <OrbitronText weight="700" style={{ fontSize: 11, letterSpacing: 2, color: colors.dim, marginBottom: 12 }}>
          HISTÓRICO
        </OrbitronText>

        {loading ? (
          <View style={{ paddingVertical: 30, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : history.length === 0 ? (
          <RajdhaniText style={{ fontSize: 13, color: colors.muted, textAlign: 'center', paddingVertical: 20 }}>
            Nenhuma medida registrada ainda.
          </RajdhaniText>
        ) : (
          <View style={{ gap: 8, paddingBottom: 20 }}>
            {history.map((m) => (
              <View
                key={m.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: colors.bg1,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>
                  {new Date(m.measured_at).toLocaleDateString('pt-BR')}
                </RajdhaniText>
                <View style={{ flexDirection: 'row', gap: 14 }}>
                  {m.weight_kg !== null && (
                    <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.text }}>
                      {m.weight_kg}kg
                    </RajdhaniText>
                  )}
                  {m.height_cm !== null && (
                    <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.text }}>
                      {m.height_cm}cm
                    </RajdhaniText>
                  )}
                  {m.body_fat_pct !== null && (
                    <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.text }}>
                      {m.body_fat_pct}% gordura
                    </RajdhaniText>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  )
}
