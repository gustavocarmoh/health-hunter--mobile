import React, { useState, useEffect } from 'react'
import { View, FlatList, TextInput, ActivityIndicator } from 'react-native'
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
import friendsApi, { Friend } from '../api/friends'

type Props = NativeStackScreenProps<RootStackParamList, 'Friends'>

export default function FriendsScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { showToast } = useAppState()
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    setLoading(true)
    try {
      const { friends: data } = await friendsApi.getFriends(1, 50)
      setFriends(data)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    setDeleting(userId)
    try {
      await friendsApi.unfollow(userId)
      setFriends((prev) => prev.filter((f) => f.id !== userId))
      showToast('Amigo removido')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setDeleting(null)
    }
  }

  const renderFriend = ({ item }: { item: Friend }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.bg1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#7C3AED',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <OrbitronText weight="800" style={{ fontSize: 14, color: '#fff' }}>
          {item.name.charAt(0)}
        </OrbitronText>
      </View>

      <View style={{ flex: 1 }}>
        <RajdhaniText weight="700" style={{ fontSize: 14, color: colors.text }}>
          {item.name}
        </RajdhaniText>
        <RajdhaniText style={{ fontSize: 11, color: colors.muted }}>
          Rank {item.rank} • {item.xp.toLocaleString()} XP
        </RajdhaniText>
        <View
          style={{
            marginTop: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
            backgroundColor:
              item.status === 'online'
                ? 'rgba(34, 197, 94, 0.2)'
                : 'rgba(107, 114, 128, 0.2)',
            borderRadius: 4,
            alignSelf: 'flex-start',
          }}
        >
          <RajdhaniText weight="700" style={{ fontSize: 9, color: item.status === 'online' ? '#22C55E' : '#6B7280' }}>
            {item.status === 'online' ? '🟢 ONLINE' : '⚫ OFFLINE'}
          </RajdhaniText>
        </View>
      </View>

      <PressableScale
        onPress={() => handleDelete(item.id)}
        disabled={deleting !== null}
        scaleTo={0.85}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: deleting === item.id ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(239, 68, 68, 0.4)',
        }}
      >
        {deleting === item.id ? (
          <ActivityIndicator size="small" color="#EF4444" />
        ) : (
          <OrbitronText weight="800" style={{ fontSize: 10, color: '#EF4444' }}>
            ✕
          </OrbitronText>
        )}
      </PressableScale>
    </View>
  )

  return (
    <ScreenContainer withTabBarPadding={false}>
      <ScreenHeader
        title="AMIGOS"
        action={
          <PressableScale
            onPress={() => navigation.navigate('AddFriend')}
            scaleTo={0.9}
            style={{ padding: 8 }}
          >
            <OrbitronText weight="800" style={{ fontSize: 18, color: '#7C3AED' }}>
              +
            </OrbitronText>
          </PressableScale>
        }
      />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : friends.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <OrbitronText weight="700" style={{ fontSize: 20, color: colors.muted }}>
            👥
          </OrbitronText>
          <RajdhaniText style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>
            Nenhum amigo ainda.{'\n'}Adicione amigos para jogar junto!
          </RajdhaniText>
          <PressableScale
            onPress={() => navigation.navigate('AddFriend')}
            scaleTo={0.95}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              backgroundColor: '#7C3AED',
              marginTop: 12,
            }}
          >
            <OrbitronText weight="800" style={{ fontSize: 12, color: '#fff' }}>
              ADICIONAR AMIGOS
            </OrbitronText>
          </PressableScale>
        </View>
      ) : (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          scrollEnabled
        />
      )}
    </ScreenContainer>
  )
}
