import React, { useEffect, useRef, useState } from 'react'
import { View, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import * as Location from 'expo-location'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
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
import missionsApi from '../api/missions'

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

const MIN_DURATION_SEC = 60
const MIN_DISTANCE_M = 1

type Mode = 'auto' | 'manual'
type AutoPhase = 'idle' | 'tracking' | 'review'

interface TrackedCoord {
  latitude: number
  longitude: number
  altitude?: number
}

interface TrackedRoutePoint extends TrackedCoord {
  timestamp: number
}

// Tipos de exercício cuja distância percorrida faz sentido/é o que se quer medir — rastreiam o
// percurso completo por GPS. Os demais (musculação, HIIT, etc.) só precisam de UMA posição
// (contexto de onde o treino aconteceu) e são cronometrados por tempo, não por distância.
const DISTANCE_BASED_TYPES = new Set(['Corrida', 'Caminhada', 'Ciclismo', 'Natação'])

const DURATION_CHOICES_SEC = [300, 600, 900, 1800, 2700, 3600]

/** Haversine — distância em metros entre dois pontos GPS. */
function distanceBetween(a: TrackedCoord, b: TrackedCoord): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function AddActivityScreen({ navigation, route }: Props) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { showToast, refreshDashboard } = useAppState()

  const missionId = route.params?.missionId
  const missionName = route.params?.missionName
  const validationType = route.params?.validationType
  const targetDistanceM = route.params?.targetDistanceM
  const targetDurationSec = route.params?.targetDurationSec
  const isMissionMode = Boolean(missionId)

  const [mode, setMode] = useState<Mode>('auto')
  const [exerciseType, setExerciseType] = useState(EXERCISE_TYPES[0])
  const [loading, setLoading] = useState(false)

  // Modo missão já diz qual validação vale (GPS_DISTANCE ou DURATION); fora de missão, decide
  // pelo tipo de exercício escolhido.
  const isDistanceTracking = isMissionMode
    ? validationType === 'GPS_DISTANCE'
    : DISTANCE_BASED_TYPES.has(exerciseType)
  const isDurationTracking = isMissionMode
    ? validationType === 'DURATION'
    : !DISTANCE_BASED_TYPES.has(exerciseType)

  const [manualTargetDurationSec, setManualTargetDurationSec] = useState(DURATION_CHOICES_SEC[1])
  const effectiveTargetDurationSec = isMissionMode ? targetDurationSec : manualTargetDurationSec
  const effectiveTargetDistanceM = isMissionMode ? targetDistanceM : undefined
  // Em modo missão a atividade já é a da missão (ex.: "Meditação Diária") — o seletor de tipo
  // de exercício não se aplica e nem tem uma opção correspondente na lista genérica.
  const effectiveExerciseType = isMissionMode ? missionName ?? 'Missão' : exerciseType

  // --- modo manual (form original) ---
  const [distanceKm, setDistanceKm] = useState('')
  const [durationMin, setDurationMin] = useState('')
  const [manualBpm, setManualBpm] = useState('')
  const [latitude, setLatitude] = useState('-23.5505')
  const [longitude, setLongitude] = useState('-46.6333')

  // --- modo automático (rastreamento ao vivo) ---
  const [autoPhase, setAutoPhase] = useState<AutoPhase>('idle')
  const [elapsedSec, setElapsedSec] = useState(0)
  const [distanceM, setDistanceM] = useState(0)
  const [autoBpm, setAutoBpm] = useState('')
  const [startingTracking, setStartingTracking] = useState(false)
  const lastCoordRef = useRef<TrackedCoord | null>(null)
  const routeRef = useRef<TrackedRoutePoint[]>([])
  const startedAtRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const watcherRef = useRef<Location.LocationSubscription | null>(null)

  const stopTrackers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    watcherRef.current?.remove()
    watcherRef.current = null
  }

  // Garante que GPS/timer não fiquem rodando em segundo plano se o usuário sair da tela.
  useEffect(() => stopTrackers, [])

  // Sem isso, o Android pode suspender/matar o app se a tela apagar durante o rastreamento —
  // especialmente crítico em atividades por tempo (ex.: meditação), onde é natural o usuário
  // deixar o celular de lado e a tela travar antes do cronômetro zerar.
  useEffect(() => {
    if (autoPhase === 'tracking') {
      activateKeepAwakeAsync('add-activity-tracking').catch(() => {})
    } else {
      deactivateKeepAwake('add-activity-tracking')
    }
    return () => {
      deactivateKeepAwake('add-activity-tracking')
    }
  }, [autoPhase])

  const startTracking = async () => {
    // Evita duas corridas simultâneas de setInterval/watchPositionAsync se o usuário tocar
    // "Iniciar" mais de uma vez enquanto aguarda a permissão/posição inicial (pode levar alguns
    // segundos) — cada chamada extra deixaria um timer/watcher órfão rodando pra sempre, porque
    // timerRef/watcherRef só guardam a referência mais recente.
    if (startingTracking || autoPhase !== 'idle') return
    setStartingTracking(true)

    // Cinto e suspensório: garante que não sobrou nada de uma corrida anterior antes de criar
    // um novo timer/watcher.
    stopTrackers()

    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        showToast('Permissão de localização negada. Ative nas configurações do app.', 'error')
        return
      }

      let initialCoord: TrackedCoord
      try {
        const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
        initialCoord = {
          latitude: initial.coords.latitude,
          longitude: initial.coords.longitude,
          altitude: initial.coords.altitude ?? undefined,
        }
      } catch {
        showToast('Não foi possível obter sua localização. Verifique o GPS.', 'error')
        return
      }

      lastCoordRef.current = initialCoord
      // Atividades sem rastreamento por distância só precisam dessa única posição — não faz
      // sentido guardar um "percurso" de um treino de musculação parado no mesmo lugar.
      routeRef.current = isDistanceTracking ? [{ ...initialCoord, timestamp: Date.now() }] : []

      setDistanceM(0)
      setElapsedSec(0)
      startedAtRef.current = Date.now()
      setAutoPhase('tracking')

      timerRef.current = setInterval(() => {
        setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000))
      }, 1000)

      // Só liga o rastreamento contínuo de GPS (e o consumo de bateria que isso traz) quando a
      // distância percorrida importa de fato. Atividades baseadas em tempo ficam só com a
      // posição inicial e o cronômetro.
      if (isDistanceTracking) {
        watcherRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 4000, distanceInterval: 5 },
          (update) => {
            const next: TrackedCoord = {
              latitude: update.coords.latitude,
              longitude: update.coords.longitude,
              altitude: update.coords.altitude ?? undefined,
            }
            const prev = lastCoordRef.current
            if (prev) {
              const delta = distanceBetween(prev, next)
              // Ignora saltos absurdos de precisão do GPS parado (ruído < 2m não conta).
              if (delta > 2) {
                setDistanceM((d) => d + delta)
                routeRef.current.push({ ...next, timestamp: Date.now() })
              }
            }
            lastCoordRef.current = next
          },
        )
      }
    } finally {
      setStartingTracking(false)
    }
  }

  const finishTracking = () => {
    stopTrackers()
    if (elapsedSec < MIN_DURATION_SEC) {
      showToast(`Atividade muito curta. Continue por pelo menos ${MIN_DURATION_SEC}s.`, 'error')
      return
    }
    setAutoPhase('review')
  }

  // Atividade baseada em tempo (missão DURATION, ou fora de missão qualquer tipo que não seja
  // de distância): o cronômetro conta regressivo a partir da meta escolhida e a atividade
  // conclui sozinha ao zerar — não existe botão de "finalizar antes da hora".
  useEffect(() => {
    if (
      isDurationTracking &&
      autoPhase === 'tracking' &&
      effectiveTargetDurationSec !== undefined &&
      elapsedSec >= effectiveTargetDurationSec
    ) {
      finishTracking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedSec, autoPhase, isDurationTracking, effectiveTargetDurationSec])

  const discardTracking = () => {
    stopTrackers()
    setAutoPhase('idle')
    setElapsedSec(0)
    setDistanceM(0)
    setAutoBpm('')
    lastCoordRef.current = null
    routeRef.current = []
  }

  const handleSubmitAuto = async () => {
    const bpm = parseInt(autoBpm)
    if (!autoBpm.trim() || Number.isNaN(bpm) || bpm < 30 || bpm > 220) {
      showToast('Informe o BPM médio (entre 30 e 220)', 'error')
      return
    }
    const finalDistance = Math.max(MIN_DISTANCE_M, Math.round(distanceM))
    const coord = lastCoordRef.current ?? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    const route = isDistanceTracking && routeRef.current.length >= 2 ? routeRef.current : undefined

    setLoading(true)
    try {
      const activity = await activitiesApi.logActivity({
        distancia_m: finalDistance,
        duracao_seg: elapsedSec,
        tipo_exercicio: effectiveExerciseType,
        coordenadas_gps: coord,
        route_gps: route,
        bpm_medio: bpm,
        source: 'TRACKED',
      })

      if (isMissionMode && missionId) {
        try {
          await missionsApi.completeWithActivity(missionId, activity.activity_id)
          showToast('✨ Missão concluída!')
        } catch (missionErr) {
          // A atividade já foi salva — só a vinculação com a missão falhou (ex.: não bateu a meta).
          showToast(getErrorMessage(missionErr), 'error')
        }
      } else {
        showToast('✨ Atividade registrada com sucesso!')
      }

      await refreshDashboard()
      navigation.goBack()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitManual = async () => {
    if (!distanceKm.trim() || !durationMin.trim() || !manualBpm.trim()) {
      showToast('Preencha todos os campos obrigatórios', 'error')
      return
    }

    setLoading(true)
    try {
      const distanceMeter = parseFloat(distanceKm) * 1000
      const durationSeconds = parseInt(durationMin) * 60
      const bpm = parseInt(manualBpm)

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
        <ScreenHeader title="REGISTRAR ATIVIDADE" />

        <ScrollView showsVerticalScrollIndicator={false} style={{ gap: 20 }}>
          {isMissionMode && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: 'rgba(124,58,237,.12)',
                borderWidth: 1,
                borderColor: '#7C3AED',
                borderRadius: 10,
                padding: 12,
                marginBottom: 20,
              }}
            >
              <OrbitronText weight="800" style={{ fontSize: 16 }}>🎯</OrbitronText>
              <View style={{ flex: 1 }}>
                <RajdhaniText weight="700" style={{ fontSize: 13, color: colors.text }}>{missionName}</RajdhaniText>
                <RajdhaniText style={{ fontSize: 11, color: '#A78BFA' }}>
                  {validationType === 'GPS_DISTANCE' && targetDistanceM
                    ? `Meta: ${(targetDistanceM / 1000).toFixed(1)} km rastreados por GPS`
                    : validationType === 'DURATION' && targetDurationSec
                      ? `Meta: ${formatClock(targetDurationSec)} sem parar o cronômetro`
                      : 'Conclua a atividade para validar a missão'}
                </RajdhaniText>
              </View>
            </View>
          )}

          {/* Seletor de modo — só antes de iniciar o rastreamento, e só fora do modo missão */}
          {autoPhase === 'idle' && !isMissionMode && (
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {(['auto', 'manual'] as Mode[]).map((m) => (
                <PressableScale
                  key={m}
                  onPress={() => setMode(m)}
                  scaleTo={0.97}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    backgroundColor: mode === m ? '#7C3AED' : colors.bg1,
                    borderWidth: 1,
                    borderColor: mode === m ? '#7C3AED' : colors.border,
                  }}
                >
                  <OrbitronText weight="700" style={{ fontSize: 11, letterSpacing: 1, color: mode === m ? '#fff' : colors.dim }}>
                    {m === 'auto' ? 'AUTOMÁTICO (GPS)' : 'MANUAL'}
                  </OrbitronText>
                </PressableScale>
              ))}
            </View>
          )}

          {/* Tipo de exercício — não se aplica em modo missão, já que a atividade é a da missão */}
          {!isMissionMode && (
            <View style={{ gap: 8, marginBottom: 20 }}>
              <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
                TIPO DE EXERCÍCIO
              </RajdhaniText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingRight: 16 }}
              >
                {EXERCISE_TYPES.map((type) => (
                  <PressableScale
                    key={type}
                    onPress={() => autoPhase === 'idle' && setExerciseType(type)}
                    disabled={autoPhase !== 'idle'}
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
                      opacity: autoPhase !== 'idle' && exerciseType !== type ? 0.4 : 1,
                    }}
                  >
                    <RajdhaniText weight="700" style={{ fontSize: 12, color: exerciseType === type ? '#fff' : colors.text }}>
                      {type}
                    </RajdhaniText>
                  </PressableScale>
                ))}
              </ScrollView>
            </View>
          )}

          {mode === 'auto' ? (
            <>
              {autoPhase === 'idle' && (
                <View style={{ alignItems: 'center', gap: 16, paddingVertical: 24 }}>
                  <RajdhaniText style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>
                    {isDistanceTracking
                      ? 'O percurso é gravado por GPS enquanto a atividade roda, e a distância é validada a partir dele. O BPM médio é pedido ao final, já que o celular não tem sensor de frequência cardíaca.'
                      : 'Essa atividade é cronometrada por tempo — só uma posição de GPS é registrada. O BPM médio é pedido ao final.'}
                  </RajdhaniText>

                  {!isMissionMode && isDurationTracking && (
                    <View style={{ width: '100%', gap: 8 }}>
                      <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
                        DURAÇÃO DO TREINO
                      </RajdhaniText>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {DURATION_CHOICES_SEC.map((sec) => (
                          <PressableScale
                            key={sec}
                            onPress={() => setManualTargetDurationSec(sec)}
                            scaleTo={0.95}
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 16,
                              borderRadius: 8,
                              backgroundColor: manualTargetDurationSec === sec ? '#7C3AED' : colors.bg1,
                              borderWidth: 1,
                              borderColor: manualTargetDurationSec === sec ? '#7C3AED' : colors.border,
                            }}
                          >
                            <RajdhaniText weight="700" style={{ fontSize: 13, color: manualTargetDurationSec === sec ? '#fff' : colors.text }}>
                              {sec / 60} min
                            </RajdhaniText>
                          </PressableScale>
                        ))}
                      </View>
                    </View>
                  )}

                  <PressableScale
                    onPress={startTracking}
                    disabled={startingTracking}
                    scaleTo={0.97}
                    style={{
                      width: '100%',
                      paddingVertical: 18,
                      borderRadius: 12,
                      backgroundColor: startingTracking ? 'rgba(124,58,237,.5)' : '#7C3AED',
                      alignItems: 'center',
                    }}
                  >
                    {startingTracking ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <OrbitronText weight="800" style={{ fontSize: 14, color: '#fff', letterSpacing: 1 }}>
                        ▶ INICIAR ATIVIDADE
                      </OrbitronText>
                    )}
                  </PressableScale>
                </View>
              )}

              {autoPhase === 'tracking' && (() => {
                const remainingSec = isDurationTracking
                  ? Math.max(0, (effectiveTargetDurationSec ?? 0) - elapsedSec)
                  : null
                const hasDistanceTarget = isDistanceTracking && effectiveTargetDistanceM !== undefined
                const distanceMet = hasDistanceTarget ? distanceM >= effectiveTargetDistanceM! : true
                const canFinish = !isDurationTracking && distanceMet

                return (
                  <View style={{ alignItems: 'center', gap: 24, paddingVertical: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' }} />
                      <RajdhaniText weight="700" style={{ fontSize: 12, letterSpacing: 2, color: '#EF4444' }}>
                        {isDurationTracking ? 'CONTAGEM REGRESSIVA' : 'GRAVANDO PERCURSO'}
                      </RajdhaniText>
                    </View>

                    <OrbitronText weight="900" style={{ fontSize: 56, color: colors.text, letterSpacing: 1 }}>
                      {formatClock(isDurationTracking ? remainingSec! : elapsedSec)}
                    </OrbitronText>

                    <View style={{ flexDirection: 'row', gap: 32 }}>
                      {isDistanceTracking && (
                        <View style={{ alignItems: 'center', gap: 2 }}>
                          <OrbitronText weight="800" style={{ fontSize: 24, color: hasDistanceTarget && !distanceMet ? '#FBBF24' : '#00F5FF' }}>
                            {(distanceM / 1000).toFixed(2)}
                            {hasDistanceTarget ? ` / ${(effectiveTargetDistanceM! / 1000).toFixed(1)}` : ''}
                          </OrbitronText>
                          <RajdhaniText style={{ fontSize: 11, color: colors.dim, letterSpacing: 1 }}>KM</RajdhaniText>
                        </View>
                      )}
                      <View style={{ alignItems: 'center', gap: 2, maxWidth: 160 }}>
                        <OrbitronText
                          weight="800"
                          numberOfLines={1}
                          style={{ fontSize: isMissionMode ? 14 : 24, color: colors.text }}
                        >
                          {effectiveExerciseType}
                        </OrbitronText>
                        <RajdhaniText style={{ fontSize: 11, color: colors.dim, letterSpacing: 1 }}>TIPO</RajdhaniText>
                      </View>
                    </View>

                    {isDurationTracking ? (
                      <RajdhaniText style={{ fontSize: 12, color: colors.muted, textAlign: 'center' }}>
                        A atividade conclui sozinha quando o cronômetro zerar — não dá pra encerrar antes.
                      </RajdhaniText>
                    ) : (
                      <PressableScale
                        onPress={finishTracking}
                        disabled={!canFinish}
                        scaleTo={0.97}
                        style={{
                          width: '100%',
                          paddingVertical: 18,
                          borderRadius: 12,
                          backgroundColor: canFinish ? '#EF4444' : 'rgba(107,114,128,.3)',
                          alignItems: 'center',
                          marginTop: 8,
                        }}
                      >
                        <OrbitronText weight="800" style={{ fontSize: 14, color: '#fff', letterSpacing: 1 }}>
                          {hasDistanceTarget && !distanceMet ? 'CONTINUE ATÉ BATER A META' : '■ FINALIZAR ATIVIDADE'}
                        </OrbitronText>
                      </PressableScale>
                    )}
                  </View>
                )
              })()}

              {autoPhase === 'review' && (
                <View style={{ gap: 20, paddingVertical: 8 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      backgroundColor: colors.bg1,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingVertical: 20,
                    }}
                  >
                    <View style={{ alignItems: 'center', gap: 2 }}>
                      <OrbitronText weight="800" style={{ fontSize: 20, color: colors.text }}>
                        {(distanceM / 1000).toFixed(2)} km
                      </OrbitronText>
                      <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>DISTÂNCIA</RajdhaniText>
                    </View>
                    <View style={{ alignItems: 'center', gap: 2 }}>
                      <OrbitronText weight="800" style={{ fontSize: 20, color: colors.text }}>
                        {formatClock(elapsedSec)}
                      </OrbitronText>
                      <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>DURAÇÃO</RajdhaniText>
                    </View>
                  </View>

                  <View style={{ gap: 6 }}>
                    <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
                      BPM MÉDIO (INSIRA MANUALMENTE)
                    </RajdhaniText>
                    <TextInput
                      placeholder="Ex: 145"
                      placeholderTextColor={colors.muted}
                      keyboardType="number-pad"
                      value={autoBpm}
                      onChangeText={setAutoBpm}
                      autoFocus
                      style={inputStyle}
                    />
                    <RajdhaniText style={{ fontSize: 11, color: colors.muted }}>Entre 30 e 220 BPM</RajdhaniText>
                  </View>

                  <PressableScale
                    onPress={handleSubmitAuto}
                    disabled={loading}
                    scaleTo={0.98}
                    style={{
                      paddingVertical: 14,
                      borderRadius: 8,
                      backgroundColor: loading ? 'rgba(124, 58, 237, 0.5)' : '#7C3AED',
                      alignItems: 'center',
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

                  <PressableScale onPress={discardTracking} scaleTo={0.97} style={{ alignItems: 'center', paddingVertical: 8 }}>
                    <RajdhaniText weight="600" style={{ fontSize: 12, color: colors.muted }}>
                      Descartar e começar de novo
                    </RajdhaniText>
                  </PressableScale>
                </View>
              )}
            </>
          ) : (
            <>
              {/* Distância */}
              <View style={{ gap: 6, marginBottom: 20 }}>
                <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
                  DISTÂNCIA (KM)
                </RajdhaniText>
                <TextInput
                  placeholder="Ex: 5.5"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  value={distanceKm}
                  onChangeText={setDistanceKm}
                  style={inputStyle}
                />
                <RajdhaniText style={{ fontSize: 11, color: colors.muted }}>Mínimo 0.1 km, máximo 200 km</RajdhaniText>
              </View>

              {/* Duração */}
              <View style={{ gap: 6, marginBottom: 20 }}>
                <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
                  DURAÇÃO (MINUTOS)
                </RajdhaniText>
                <TextInput
                  placeholder="Ex: 30"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  value={durationMin}
                  onChangeText={setDurationMin}
                  style={inputStyle}
                />
                <RajdhaniText style={{ fontSize: 11, color: colors.muted }}>Mínimo 1 minuto, máximo 24 horas</RajdhaniText>
              </View>

              {/* BPM Médio */}
              <View style={{ gap: 6, marginBottom: 20 }}>
                <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, letterSpacing: 1 }}>
                  BPM MÉDIO
                </RajdhaniText>
                <TextInput
                  placeholder="Ex: 145"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  value={manualBpm}
                  onChangeText={setManualBpm}
                  style={inputStyle}
                />
                <RajdhaniText style={{ fontSize: 11, color: colors.muted }}>Entre 30 e 220 BPM</RajdhaniText>
              </View>

              {/* Coordenadas GPS (hidden, preenchidas com default) */}
              <View style={{ gap: 6, marginBottom: 20 }}>
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
                      style={{ ...inputStyle, paddingHorizontal: 12, fontSize: 13 }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      placeholder="Longitude"
                      placeholderTextColor={colors.muted}
                      keyboardType="decimal-pad"
                      value={longitude}
                      onChangeText={setLongitude}
                      style={{ ...inputStyle, paddingHorizontal: 12, fontSize: 13 }}
                    />
                  </View>
                </View>
                <RajdhaniText style={{ fontSize: 11, color: colors.muted }}>
                  São Paulo por padrão. Editável se tiver GPS.
                </RajdhaniText>
              </View>

              {/* Submit Button */}
              <PressableScale
                onPress={handleSubmitManual}
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
            </>
          )}
        </ScrollView>
      </ScreenContainer>
    </KeyboardAvoidingView>
  )
}
