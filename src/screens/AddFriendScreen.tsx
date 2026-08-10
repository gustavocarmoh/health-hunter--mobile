import React, { useState } from 'react'
import { View, TextInput, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
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

type Props = NativeStackScreenProps<RootStackParamList, 'AddFriend'>

interface SearchResult extends Friend {
  isFollowing?: boolean
}

export default function AddFriendScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { showToast } = useAppState()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    setSearch(query)
    if (!query.trim()) {
      setResults([])
      return
    }

    setSearching(true)
    try {
      console.log('🔍 Searching hunters:', query)
      const { results: data } = await friendsApi.searchHunters(query, 50)
      console.log('✅ Search results:', data.length)
      setResults(data)
    } catch (err) {
      console.error('❌ Search error:', err)
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSearching(false)
    }
  }

  const handleAddFriend = async (userId: string) => {
    setAdding(userId)
    try {
      await friendsApi.follow(userId)
      setResults((prev) =>
        prev.map((f) =>
          f.id === userId ? { ...f, isFollowing: true } : f
        )
      )
      showToast('✨ Amigo adicionado!')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setAdding(null)
    }
  }

  const renderResult = ({ item }: { item: SearchResult }) => (
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
      </View>

      <PressableScale
        onPress={() => handleAddFriend(item.id)}
        disabled={adding !== null || item.isFollowing}
        scaleTo={0.85}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: item.isFollowing
            ? 'rgba(34, 197, 94, 0.2)'
            : 'rgba(124, 58, 237, 0.1)',
          borderWidth: 1,
          borderColor: item.isFollowing
            ? 'rgba(34, 197, 94, 0.4)'
            : 'rgba(124, 58, 237, 0.4)',
        }}
      >
        {adding === item.id ? (
          <ActivityIndicator size="small" color="#7C3AED" />
        ) : item.isFollowing ? (
          <OrbitronText weight="800" style={{ fontSize: 10, color: '#22C55E' }}>
            ✓
          </OrbitronText>
        ) : (
          <OrbitronText weight="800" style={{ fontSize: 10, color: '#7C3AED' }}>
            +
          </OrbitronText>
        )}
      </PressableScale>
    </View>
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bg0 }}
    >
      <ScreenContainer withTabBarPadding={false}>
        <ScreenHeader title="ADICIONAR AMIGOS" />

        <View style={{ gap: 16, marginBottom: 16 }}>
          <TextInput
            placeholder="Procure um hunter..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={handleSearch}
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

          {searching && (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          )}

          {!searching && search && results.length === 0 && (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <RajdhaniText style={{ fontSize: 13, color: colors.muted }}>
                Nenhum hunter encontrado
              </RajdhaniText>
            </View>
          )}

          {!searching && results.length > 0 && (
            <View>
              <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, marginBottom: 8, letterSpacing: 1 }}>
                RESULTADOS ({results.length})
              </RajdhaniText>
              <FlatList
                data={results}
                renderItem={renderResult}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {!search && !searching && (
            <View style={{ alignItems: 'center', padding: 40, gap: 12 }}>
              <OrbitronText weight="700" style={{ fontSize: 24, color: colors.muted }}>
                🔍
              </OrbitronText>
              <RajdhaniText style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>
                Digite o nome de um hunter para começar a procurar amigos!
              </RajdhaniText>
            </View>
          )}
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  )
}
