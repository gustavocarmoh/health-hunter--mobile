import React from 'react'
import { View } from 'react-native'
import { ACCENT } from '../theme/colors'
import { RajdhaniText } from './Typography'

export interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
  colors: {
    bg0: string
    bg1: string
    text: string
    muted: string
    border: string
  }
}

export default function ChatBubble({ role, content, colors }: ChatBubbleProps) {
  const isUser = role === 'user'

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          maxWidth: '85%',
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 12,
          backgroundColor: isUser ? ACCENT.purple : colors.bg1,
          borderWidth: isUser ? 0 : 1,
          borderColor: isUser ? 'transparent' : colors.border,
        }}
      >
        <RajdhaniText
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: isUser ? '#FFFFFF' : colors.text,
          }}
        >
          {content}
        </RajdhaniText>
      </View>
    </View>
  )
}
