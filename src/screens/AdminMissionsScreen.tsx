import React, { useState } from 'react'
import { View, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import ScreenContainer from '../ui/ScreenContainer'
import ScreenHeader from '../ui/ScreenHeader'
import { OrbitronText, RajdhaniText } from '../ui/Typography'
import PressableScale from '../ui/PressableScale'
import { useTheme } from '../theme/ThemeContext'
import { useAppState } from '../state/AppStateContext'
import { getErrorMessage } from '../api/errors'
import adminApi, { GenerateDailyReport } from '../api/admin'

const CATEGORIES = ['RUNNING', 'WORKOUT', 'MEDITATION', 'HYDRATION', 'WALKING', 'STRETCHING', 'YOGA', 'HIIT']
const DIFFICULTIES = ['EASY', 'NORMAL', 'HARD', 'VERY_HARD']

export default function AdminMissionsScreen() {
  const { colors } = useTheme()
  const { showToast } = useAppState()

  const [triggering, setTriggering] = useState(false)
  const [report, setReport] = useState<GenerateDailyReport | null>(null)

  const [targetUserId, setTargetUserId] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0])
  const [xp, setXp] = useState('')
  const [icon, setIcon] = useState('')
  const [creating, setCreating] = useState(false)

  const triggerDailyJob = async () => {
    setTriggering(true)
    setReport(null)
    try {
      const result = await adminApi.generateDailyMissionsForAll()
      setReport(result)
      showToast(`✨ Missões geradas para ${result.created} hunter(s)`)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setTriggering(false)
    }
  }

  const createManualMission = async () => {
    if (!targetUserId.trim() || !name.trim() || !xp.trim()) {
      showToast('Preencha ao menos o ID do hunter, o nome e o XP', 'error')
      return
    }
    const xpValue = parseInt(xp)
    if (Number.isNaN(xpValue) || xpValue <= 0) {
      showToast('XP inválido', 'error')
      return
    }

    setCreating(true)
    try {
      await adminApi.createIndividualMission({
        userId: targetUserId.trim(),
        name: name.trim(),
        category,
        difficulty,
        xp: xpValue,
        icon: icon.trim() || undefined,
      })
      showToast('✨ Missão criada para o hunter!')
      setTargetUserId('')
      setName('')
      setXp('')
      setIcon('')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setCreating(false)
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bg0 }}
    >
      <ScreenContainer withTabBarPadding={false}>
        <ScreenHeader title="PAINEL ADMIN · MISSÕES" />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Geração automática via IA */}
          <View style={{ gap: 10, marginBottom: 28 }}>
            <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
              GERAÇÃO DIÁRIA AUTOMÁTICA (IA)
            </RajdhaniText>
            <RajdhaniText style={{ fontSize: 13, color: colors.muted }}>
              Dispara agora o mesmo job que roda sozinho todo dia às 05h: gera missões via IA (com
              fallback estático) para todo hunter que ainda não tem missões hoje.
            </RajdhaniText>

            <PressableScale
              onPress={triggerDailyJob}
              disabled={triggering}
              scaleTo={0.98}
              style={{
                paddingVertical: 14,
                borderRadius: 8,
                backgroundColor: triggering ? 'rgba(124, 58, 237, 0.5)' : '#7C3AED',
                alignItems: 'center',
                marginTop: 4,
              }}
            >
              {triggering ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <OrbitronText weight="800" style={{ fontSize: 13, color: '#fff', letterSpacing: 1 }}>
                  ⚡ DISPARAR JOB AGORA
                </OrbitronText>
              )}
            </PressableScale>

            {report && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  backgroundColor: colors.bg1,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingVertical: 16,
                  marginTop: 4,
                }}
              >
                <View style={{ alignItems: 'center', gap: 2 }}>
                  <OrbitronText weight="800" style={{ fontSize: 20, color: colors.text }}>
                    {report.processed}
                  </OrbitronText>
                  <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>PROCESSADOS</RajdhaniText>
                </View>
                <View style={{ alignItems: 'center', gap: 2 }}>
                  <OrbitronText weight="800" style={{ fontSize: 20, color: '#00F5FF' }}>
                    {report.created}
                  </OrbitronText>
                  <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>CRIADOS</RajdhaniText>
                </View>
                <View style={{ alignItems: 'center', gap: 2 }}>
                  <OrbitronText weight="800" style={{ fontSize: 20, color: colors.muted }}>
                    {report.skipped}
                  </OrbitronText>
                  <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>JÁ TINHAM</RajdhaniText>
                </View>
              </View>
            )}
          </View>

          {/* Criação totalmente manual */}
          <View style={{ gap: 10, marginBottom: 40 }}>
            <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
              CRIAR MISSÃO MANUAL PARA UM HUNTER
            </RajdhaniText>

            <TextInput
              placeholder="ID do hunter (UUID)"
              placeholderTextColor={colors.muted}
              value={targetUserId}
              onChangeText={setTargetUserId}
              autoCapitalize="none"
              style={inputStyle}
            />

            <TextInput
              placeholder="Nome da missão"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              style={inputStyle}
            />

            <RajdhaniText weight="700" style={{ fontSize: 11, color: colors.dim, letterSpacing: 1, marginTop: 4 }}>
              CATEGORIA
            </RajdhaniText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {CATEGORIES.map((c) => (
                <PressableScale
                  key={c}
                  onPress={() => setCategory(c)}
                  scaleTo={0.95}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: category === c ? '#7C3AED' : colors.bg1,
                    borderWidth: 1,
                    borderColor: category === c ? '#7C3AED' : colors.border,
                  }}
                >
                  <RajdhaniText weight="700" style={{ fontSize: 11, color: category === c ? '#fff' : colors.text }}>
                    {c}
                  </RajdhaniText>
                </PressableScale>
              ))}
            </ScrollView>

            <RajdhaniText weight="700" style={{ fontSize: 11, color: colors.dim, letterSpacing: 1, marginTop: 4 }}>
              DIFICULDADE
            </RajdhaniText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {DIFFICULTIES.map((d) => (
                <PressableScale
                  key={d}
                  onPress={() => setDifficulty(d)}
                  scaleTo={0.95}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    backgroundColor: difficulty === d ? '#7C3AED' : colors.bg1,
                    borderWidth: 1,
                    borderColor: difficulty === d ? '#7C3AED' : colors.border,
                  }}
                >
                  <RajdhaniText weight="700" style={{ fontSize: 10, color: difficulty === d ? '#fff' : colors.text }}>
                    {d}
                  </RajdhaniText>
                </PressableScale>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="XP (ex: 150)"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  value={xp}
                  onChangeText={setXp}
                  style={inputStyle}
                />
              </View>
              <View style={{ width: 90 }}>
                <TextInput
                  placeholder="🏃"
                  placeholderTextColor={colors.muted}
                  value={icon}
                  onChangeText={setIcon}
                  style={[inputStyle, { textAlign: 'center' }]}
                />
              </View>
            </View>

            <PressableScale
              onPress={createManualMission}
              disabled={creating}
              scaleTo={0.98}
              style={{
                paddingVertical: 14,
                borderRadius: 8,
                backgroundColor: creating ? 'rgba(124, 58, 237, 0.5)' : '#7C3AED',
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <OrbitronText weight="800" style={{ fontSize: 13, color: '#fff', letterSpacing: 1 }}>
                  CRIAR MISSÃO
                </OrbitronText>
              )}
            </PressableScale>
          </View>
        </ScrollView>
      </ScreenContainer>
    </KeyboardAvoidingView>
  )
}
