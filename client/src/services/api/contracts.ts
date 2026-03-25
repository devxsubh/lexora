import { apiClient } from './client'
import type { Contract } from '@/types/contract'
import type { PartialBlock } from '@blocknote/core'

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface GenerateContractResponse {
  success: boolean
  message?: string
  data: Contract
}

/**
 * Normalises backend block content into BlockNote PartialBlock[].
 * Handles string-content fallback, missing props on headings, etc.
 */
function convertContentToBlockNote(content: unknown[]): PartialBlock[] {
  if (!Array.isArray(content)) return []

  return content.map((block: any) => {
    if (!block || !block.type) {
      return { type: 'paragraph' as const, content: [{ type: 'text' as const, text: '', styles: {} }] }
    }

    const normalizeContent = (raw: unknown): any[] => {
      if (typeof raw === 'string') return [{ type: 'text', text: raw, styles: {} }]
      if (Array.isArray(raw)) {
        return raw.map((item: any) => {
          if (typeof item === 'string') return { type: 'text', text: item, styles: {} }
          if (item?.type === 'text') return item
          if (item?.text) return { type: 'text', text: item.text, styles: item.styles || {} }
          return item
        })
      }
      return [{ type: 'text', text: '', styles: {} }]
    }

    const result: any = { id: block.id, type: block.type }

    if (block.props) {
      result.props = block.props
    } else if (block.type === 'heading') {
      result.props = { level: block.metadata?.level ?? 1 }
    }

    result.content = normalizeContent(block.content)
    return result
  })
}

export const contractService = {
  async getContracts(params?: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<{ contracts: Contract[]; total: number; page: number; limit: number }>> {
    const { data } = await apiClient.get('/contracts', { params })
    return data
  },

  async getContract(id: string): Promise<ApiResponse<Contract & { content: PartialBlock[] }>> {
    const { data } = await apiClient.get(`/contracts/${id}`)
    const contract = data.data

    if (contract.content) {
      contract.content = convertContentToBlockNote(contract.content)
    }

    return data
  },

  async createContract(contract: Partial<Contract>): Promise<ApiResponse<Contract>> {
    const { data } = await apiClient.post('/contracts', contract)
    return data
  },

  async updateContract(id: string, updates: Partial<Contract>): Promise<ApiResponse<Contract>> {
    const { data } = await apiClient.put(`/contracts/${id}`, updates)
    return data
  },

  async autoSaveContract(id: string, updates: { content: any[]; lastModified: string }): Promise<ApiResponse<Contract>> {
    const { data } = await apiClient.patch(`/contracts/${id}/autosave`, updates)
    return data
  },

  async deleteContract(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete(`/contracts/${id}`)
    return data
  },

  async generateContract(prompt: string): Promise<GenerateContractResponse> {
    const { data } = await apiClient.post('/contracts/generate', { prompt }, {
      timeout: 0,
    })

    if (data?.data?.content) {
      data.data.content = convertContentToBlockNote(data.data.content)
    }

    return data
  },

  async downloadContract(id: string, format: 'pdf' | 'docx' | 'md' | 'html' = 'pdf'): Promise<Blob> {
    const { data } = await apiClient.get(`/contracts/${id}/download`, {
      params: { format },
      responseType: 'blob',
    })
    return data
  },

  async favoriteContract(id: string): Promise<ApiResponse<Contract>> {
    const { data } = await apiClient.patch(`/contracts/${id}/favorite`)
    return data
  },

  async unfavoriteContract(id: string): Promise<ApiResponse<Contract>> {
    const { data } = await apiClient.patch(`/contracts/${id}/unfavorite`)
    return data
  },
}
