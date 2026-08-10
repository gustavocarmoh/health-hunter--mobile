import React, { useState } from 'react'
import { View, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ScreenContainer from '../ui/ScreenContainer'
import ScreenHeader from '../ui/ScreenHeader'
import PrimaryButton from '../ui/PrimaryButton'
import { OrbitronText, RajdhaniText } from '../ui/Typography'
import { useTheme } from '../theme/ThemeContext'
import { useAppState } from '../state/AppStateContext'
import { RootStackParamList } from '../navigation/types'
import { getErrorMessage } from '../api/errors'
import guildsApi from '../api/guilds'

type Props = NativeStackScreenProps<RootStackParamList, 'CreateGuild'>

export default function CreateGuildScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { showToast } = useAppState()
  const [guildName, setGuildName] = useState('')
  const [guildTag, setGuildTag] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!guildName.trim()) {
      showToast('Nome da guilda é obrigatório', 'error')
      return
    }
    if (!guildTag.trim() || guildTag.length > 4) {
      showToast('Tag deve ter entre 1-4 caracteres', 'error')
      return
    }

    setLoading(true)
    try {
      console.log('🏰 Creating guild:', { name: guildName, tag: guildTag })
      const result = await guildsApi.create({
        name: guildName.trim(),
        tag: guildTag.trim().toUpperCase(),
      })
      console.log('✅ Guild created:', result)
      showToast('✨ Guilda criada com sucesso!')
      navigation.goBack()
    } catch (err: any) {
      console.error('❌ Guild creation failed:')
      console.error('   Error:', err.message)
      console.error('   Status:', err.response?.status)
      console.error('   Data:', err.response?.data)
      showToast(getErrorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg1,
    color: colors.text,
    fontSize: 15,
    fontFamily: 'Rajdhani_400Regular' as const,
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bg0 }}
    >
      <ScreenContainer withTabBarPadding={false}>
        <ScreenHeader title="CRIAR GUILDA" />

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
          {/* Hero Section */}
          <View
            style={{
              backgroundColor: colors.bg1,
              borderWidth: 1,
              borderColor: '#7C3AED',
              borderRadius: 14,
              padding: 20,
              marginBottom: 24,
              alignItems: 'center',
            }}
          >
            <OrbitronText weight="800" style={{ fontSize: 32, color: '#7C3AED', marginBottom: 8 }}>
              👥
            </OrbitronText>
            <OrbitronText weight="700" style={{ fontSize: 18, color: colors.text, marginBottom: 4 }}>
              Funde sua Guilda
            </OrbitronText>
            <RajdhaniText style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>
              Reúna caçadores para alcançar metas coletivas e dominar os rankings
            </RajdhaniText>
          </View>

          {/* Guild Name */}
          <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, marginBottom: 8, letterSpacing: 1 }}>
            NOME DA GUILDA
          </RajdhaniText>
          <TextInput
            placeholder="Ex.: Shadow Hunters, Elite Fitness"
            placeholderTextColor={colors.muted}
            value={guildName}
            onChangeText={setGuildName}
            maxLength={50}
            style={[inputStyle, { marginBottom: 20 }]}
          />

          {/* Guild Tag */}
          <RajdhaniText weight="700" style={{ fontSize: 12, color: colors.dim, marginBottom: 8, letterSpacing: 1 }}>
            TAG (1-4 caracteres)
          </RajdhaniText>
          <TextInput
            placeholder="Ex.: SHAD, ELF"
            placeholderTextColor={colors.muted}
            value={guildTag}
            onChangeText={(t) => setGuildTag(t.toUpperCase())}
            maxLength={4}
            style={[inputStyle, { marginBottom: 24 }]}
          />

          {/* Info */}
          <View style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: 8, padding: 12, marginBottom: 24 }}>
            <RajdhaniText style={{ fontSize: 12, color: colors.text, lineHeight: 18 }}>
              💡 <RajdhaniText weight="700">Dica:</RajdhaniText> Crie uma guilda com amigos para participar em eventos coletivos e subir no ranking global juntos!
            </RajdhaniText>
          </View>

          {/* Create Button */}
          <PrimaryButton
            label={loading ? 'Criando...' : '✨ FUNDAR GUILDA'}
            onPress={handleCreate}
            loading={loading}
            bg="#7C3AED"
          />
        </ScrollView>
      </ScreenContainer>
    </KeyboardAvoidingView>
  )
}
