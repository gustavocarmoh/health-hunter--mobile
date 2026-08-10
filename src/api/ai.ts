import { httpClient } from './client'
import { TokenStorage } from './tokenStorage'

export interface ChatMessageRequest {
  conversation_id?: string
  message: string
}

export interface AiConversation {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface AiMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

async function streamResponseGenerator(response: Response): Promise<AsyncIterable<string>> {
  if (!response.body) {
    throw new Error('Resposta sem body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  async function* generate(): AsyncIterable<string> {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed = JSON.parse(data)
              if (parsed.error) {
                throw new Error(parsed.error)
              }
              if (parsed.done) {
                return
              }
              if (parsed.text) {
                yield parsed.text
              }
            } catch (e) {
              if (!(e instanceof SyntaxError)) throw e
            }
          }
        }
      }

      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6)
        try {
          const parsed = JSON.parse(data)
          if (parsed.text && !parsed.done) {
            yield parsed.text
          }
        } catch {
          // Ignora erros de parsing
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  return generate()
}

const aiApi = {
  async chat(data: ChatMessageRequest): Promise<AsyncIterable<string>> {
    const token = await TokenStorage.getAccessToken()
    const response = await fetch(`${httpClient.defaults.baseURL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao enviar mensagem')
    }

    return streamResponseGenerator(response)
  },

  async getConversations(): Promise<{ conversations: AiConversation[]; total: number }> {
    const response = await httpClient.get<{ conversations: AiConversation[]; total: number }>(
      '/ai/conversations',
    )
    return response.data
  },

  async getConversationHistory(
    conversationId: string,
  ): Promise<{ messages: AiMessage[]; total: number }> {
    const response = await httpClient.get<{ messages: AiMessage[]; total: number }>(
      `/ai/conversations/${conversationId}`,
    )
    return response.data
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await httpClient.delete(`/ai/conversations/${conversationId}`)
  },
}

export default aiApi
