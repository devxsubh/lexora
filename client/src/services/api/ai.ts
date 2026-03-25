import { apiClient, TokenManager } from './client'
import type { ChatMessage } from '@/types/ai'

type ApiResponse<T> = { success: boolean; data: T; message?: string }

type GenerateStreamEvent =
  | { type: 'chunk'; text: string }
  | { type: 'done'; contractId: string; title: string; content: any[] }
  | { type: 'error'; message: string }

export const aiService = {
  async sendMessage(contractId: string, message: string): Promise<ChatMessage> {
    const { data } = await apiClient.post<ApiResponse<ChatMessage>>(`/ai/chat/${contractId}`, { message })
    return data.data
  },

  async reviewContract(contractId: string): Promise<any> {
    const { data } = await apiClient.post(`/ai/review/${contractId}`)
    return data
  },

  generateContractStream: (
    prompt: string,
    handlers: {
      onChunk: (text: string) => void
      onDone: (payload: { contractId: string; title: string; content: any[] }) => void
      onError?: (message: string) => void
    }
  ) => {
    const controller = new AbortController()
    const baseUrl = (apiClient.defaults.baseURL || '').replace(/\/$/, '')

    ;(async () => {
      try {
        const accessToken = TokenManager.getAccessToken()
        const res = await fetch(`${baseUrl}/contracts/generate-stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        })

        if (!res.ok) {
          handlers.onError?.(`Failed to start generation (${res.status})`)
          return
        }

        if (!res.body) {
          handlers.onError?.('Streaming not supported by this browser')
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const parts = buffer.split('\n\n')
          buffer = parts.pop() || ''

          for (const part of parts) {
            const line = part
              .split('\n')
              .map((l) => l.trim())
              .find((l) => l.startsWith('data: '))
            if (!line) continue

            const json = line.replace(/^data:\s*/, '')
            let ev: GenerateStreamEvent | null = null
            try {
              ev = JSON.parse(json)
            } catch {
              continue
            }

            if (!ev) continue
            if (ev.type === 'chunk') handlers.onChunk(ev.text)
            if (ev.type === 'done') {
              handlers.onDone({ contractId: ev.contractId, title: ev.title, content: ev.content })
              return
            }
            if (ev.type === 'error') {
              handlers.onError?.(ev.message)
              return
            }
          }
        }
      } catch (e) {
        if ((e as any)?.name === 'AbortError') return
        handlers.onError?.(e instanceof Error ? e.message : 'Generation failed')
      }
    })()

    return controller
  },
}

