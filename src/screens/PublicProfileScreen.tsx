import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import ScreenContainer from '../ui/ScreenContainer'
import ScreenHeader from '../ui/ScreenHeader'
import { OrbitronText, RajdhaniText } from '../ui/Typography'
import PressableScale from '../ui/PressableScale'
import { useTheme } from '../theme/ThemeContext'
import { useAppState } from '../state/AppStateContext'
import { getErrorMessage } from '../api/errors'
import { RANK_CONFIG, Rank } from '../state/stateConfig'
import { RootStackParamList } from '../navigation/types'
import huntersApi, { PublicProfile } from '../api/hunters'
import friendsApi from '../api/friends'

type Props = NativeStackScreenProps<RootStackParamList, 'PublicProfile'>

export default function PublicProfileScreen({ route }: Props) {
  const { userId, name } = route.params
  const { colors } = useTheme()
  const { showToast } = useAppState()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [unfollowing, setUnfollowing] = useState(false)

  useEffect(() => {
    huntersApi
      .getPublicProfile(userId)
      .then(setProfile)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false))
  }, [userId, showToast])

  const handleUnfollow = async () => {
    setUnfollowing(true)
    try {
      await friendsApi.unfollow(userId)
      showToast('Amigo removido')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setUnfollowing(false)
    }
  }

  const rc = profile ? RANK_CONFIG[profile.rank_level as Rank] : undefined

  return (
    <ScreenContainer withTabBarPadding={false} header={<ScreenHeader title={name || 'PERFIL'} />}>
      {loading ? (
        <View style={{ paddingVertical: 60, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : !profile ? (
        <RajdhaniText style={{ fontSize: 13, color: colors.muted, textAlign: 'center', paddingVertical: 40 }}>
          Não foi possível carregar este perfil.
        </RajdhaniText>
      ) : (
        <View style={{ alignItems: 'center', gap: 16, paddingTop: 20 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#7C3AED',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <OrbitronText weight="800" style={{ fontSize: 28, color: '#fff' }}>
              {profile.name.charAt(0).toUpperCase()}
            </OrbitronText>
          </View>

          <OrbitronText weight="800" style={{ fontSize: 18, color: colors.text }}>
            {profile.name}
          </OrbitronText>

          {rc && (
            <View style={{ backgroundColor: rc.bg, borderWidth: 1, borderColor: rc.border, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12 }}>
              <OrbitronText weight="800" style={{ fontSize: 12, color: rc.color }}>RANK {profile.rank_level}</OrbitronText>
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              gap: 24,
              backgroundColor: colors.bg1,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
              padding: 20,
              marginTop: 8,
            }}
          >
            <View style={{ alignItems: 'center', gap: 2 }}>
              <OrbitronText weight="800" style={{ fontSize: 18, color: '#00F5FF' }}>{profile.xp.toLocaleString()}</OrbitronText>
              <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>XP</RajdhaniText>
            </View>
            {profile.city && (
              <View style={{ alignItems: 'center', gap: 2 }}>
                <OrbitronText weight="800" style={{ fontSize: 14, color: colors.text }}>{profile.city}</OrbitronText>
                <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>{profile.region_state}</RajdhaniText>
              </View>
            )}
          </View>

          <PressableScale
            onPress={handleUnfollow}
            disabled={unfollowing}
            scaleTo={0.95}
            style={{
              marginTop: 16,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,.4)',
              backgroundColor: 'rgba(239,68,68,.1)',
            }}
          >
            {unfollowing ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <OrbitronText weight="800" style={{ fontSize: 11, color: '#EF4444' }}>DEIXAR DE SEGUIR</OrbitronText>
            )}
          </PressableScale>
        </View>
      )}
    </ScreenContainer>
  )
}
