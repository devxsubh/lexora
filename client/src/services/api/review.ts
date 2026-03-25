import { apiClient } from './client'
import type { AIReviewIssue } from '@/types/ai'

export const reviewService = {
  async reviewContract(contractId: string): Promise<AIReviewIssue[]> {
    const { data } = await apiClient.post(`/review/${contractId}`)
    return data
  },
}

