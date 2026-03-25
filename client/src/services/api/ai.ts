import { apiClient } from './client'
import type { ChatMessage } from '@/types/ai'

export const aiService = {
  async sendMessage(contractId: string, message: string): Promise<ChatMessage> {
    const { data } = await apiClient.post(`/ai/chat/${contractId}`, { message })
    return data
  },

  async reviewContract(contractId: string): Promise<any> {
    const { data } = await apiClient.post(`/ai/review/${contractId}`)
    return data
  },
}

