import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../theme/ThemeContext'
import { useAppState } from '../state/AppStateContext'
import { ACCENT } from '../theme/colors'
import { RootStackParamList } from '../navigation/types'
import { OrbitronText, RajdhaniText } from '../ui/Typography'
import ChatBubble from '../ui/ChatBubble'
import PressableScale from '../ui/PressableScale'
import { getErrorMessage } from '../api/errors'
import aiApi from '../api/ai'

type Props = NativeStackScreenProps<RootStackParamList, 'AiChat'>

interface DisplayMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AiChatScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { showToast } = useAppState()
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        '🤖 Olá, caçador! Sou seu mentor de IA do Health Hunter.\n\nSou um assistente alimentado por Ollama rodando localmente em seu servidor.\n\nComo posso ajudá-lo com seu treino hoje? 🎯',
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    aiApi.getConversations().catch(() => {})
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage = input.trim()
    setInput('')

    const userMessageId = Date.now().toString()
    setMessages((prev) => [...prev, { id: userMessageId, role: 'user', content: userMessage }])

    setIsStreaming(true)

    try {
      const stream = await aiApi.chat({
        conversation_id: conversationId,
        message: userMessage,
      })

      let assistantContent = ''
      const assistantMessageId = (Date.now() + 1).toString()

      setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', content: '⏳' }])

      for await (const chunk of stream) {
        assistantContent += chunk
        setMessages((prev) => {
          const updated = [...prev]
          const lastIdx = updated.length - 1
          if (lastIdx >= 0 && updated[lastIdx].id === assistantMessageId) {
            updated[lastIdx] = { ...updated[lastIdx], content: assistantContent }
          }
          return updated
        })
      }

      if (!conversationId) {
        const convList = await aiApi.getConversations()
        if (convList.conversations.length > 0) {
          setConversationId(convList.conversations[0].id)
        }
      }
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
    } finally {
      setIsStreaming(false)
    }

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
  }

  const renderMessage = ({ item }: { item: DisplayMessage }) => (
    <ChatBubble role={item.role} content={item.content} colors={colors} />
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled={true}
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 50 : 0}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: colors.bg0,
          paddingTop: insets.top,
        }}
      >
        {/* AI Header with Gradient Effect */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 2,
            borderBottomColor: '#7C3AED',
            backgroundColor: 'rgba(124, 58, 237, 0.08)',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <OrbitronText weight="900" style={{ fontSize: 20, color: '#7C3AED' }}>
              🤖
            </OrbitronText>
            <OrbitronText weight="800" style={{ fontSize: 16, color: colors.text }}>
              AI MENTOR
            </OrbitronText>
            <View
              style={{
                backgroundColor: '#7C3AED',
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <RajdhaniText weight="700" style={{ fontSize: 9, color: '#fff', letterSpacing: 0.5 }}>
                OLLAMA
              </RajdhaniText>
            </View>
          </View>
          <RajdhaniText style={{ fontSize: 11, color: colors.muted }}>
            Assistente IA local • Respostas em tempo real
          </RajdhaniText>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          scrollEnabled
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        />

        {/* Typing Indicator */}
        {isStreaming && (
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(124, 58, 237, 0.06)',
              borderLeftWidth: 3,
              borderLeftColor: '#7C3AED',
            }}
          >
            <ActivityIndicator size="small" color="#7C3AED" />
            <RajdhaniText style={{ fontSize: 12, color: colors.muted }}>
              🤖 Mentor está processando sua pergunta...
            </RajdhaniText>
          </View>
        )}

        {/* Input Area */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: Math.max(12, insets.bottom),
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.bg0,
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 8,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Faça uma pergunta ao mentor..."
            placeholderTextColor={colors.muted}
            multiline
            maxLength={2000}
            editable={!isStreaming}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: isStreaming ? colors.dim : colors.border,
              backgroundColor: colors.bg1,
              color: colors.text,
              fontFamily: 'Rajdhani_400Regular',
              fontSize: 14,
              maxHeight: 100,
            }}
          />
          <PressableScale
            onPress={handleSend}
            disabled={!input.trim() || isStreaming}
            scaleTo={0.85}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: !input.trim() || isStreaming ? colors.border : '#7C3AED',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <OrbitronText weight="800" style={{ fontSize: 16, color: '#FFFFFF' }}>
              →
            </OrbitronText>
          </PressableScale>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
