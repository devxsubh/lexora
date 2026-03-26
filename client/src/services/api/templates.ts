import { apiClient } from './client'
import type { Contract } from '@/types/contract'

type ApiResponse<T> = { success: boolean; data: T; message?: string }

export type Template = {
  id: string
  title: string
  category?: string
  description?: string
  content?: any[]
  createdAt?: string
  updatedAt?: string
}

export const templateService = {
  async listTemplates(category?: string): Promise<Template[]> {
    const { data } = await apiClient.get<ApiResponse<Template[]>>('/templates', {
      params: category ? { category } : undefined,
    })
    return data.data
  },

  async createFromTemplate(templateId: string, title?: string): Promise<Contract> {
    const { data } = await apiClient.post<ApiResponse<Contract>>('/contracts/from-template', { templateId, title })
    return data.data
  },
}

