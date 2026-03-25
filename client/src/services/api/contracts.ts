import { apiClient } from './client'
import type { Contract } from '@/types/contract'
import type { PartialBlock } from '@blocknote/core'

export interface GenerateContractRequest {
  prompt: string
}

export interface GenerateContractResponse {
  success: boolean
  message?: string
  data: Contract & {
    _id: string
    lexiId?: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

/**
 * Converts contract content from API format to BlockNote PartialBlock format
 */
function convertContentToBlockNote(content: any[]): PartialBlock[] {
  if (!Array.isArray(content)) {
    return []
  }

  return content.map((block: any) => {
    if (!block || !block.type) {
      // Invalid block, skip it
      return {
        type: 'paragraph',
        content: [{ type: 'text', text: '', styles: {} }],
      }
    }

    // Helper function to normalize content to BlockNote format
    const normalizeContent = (content: any): any[] => {
      if (typeof content === 'string') {
        return [{ type: 'text', text: content, styles: {} }]
      }
      if (Array.isArray(content)) {
        return content.map((item: any) => {
          if (typeof item === 'string') {
            return { type: 'text', text: item, styles: {} }
          }
          // If item already has type and text, use it as-is
          if (item && typeof item === 'object' && item.type === 'text') {
            return item
          }
          // If item is an object but not in BlockNote format, try to extract text
          if (item && typeof item === 'object' && item.text) {
            return { type: 'text', text: item.text, styles: item.styles || {} }
          }
          return item
        })
      }
      return [{ type: 'text', text: '', styles: {} }]
    }

    // Handle different block types
    const baseBlock: any = {
      id: block.id,
      type: block.type,
    }

    // Add props if they exist
    if (block.props) {
      baseBlock.props = block.props
    } else if (block.type === 'heading' && block.metadata?.level) {
      baseBlock.props = { level: block.metadata.level }
    } else if (block.type === 'heading') {
      baseBlock.props = { level: 1 }
    }

    // Normalize content
    baseBlock.content = normalizeContent(block.content)

    return baseBlock
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
    try {
      const { data } = await apiClient.get(`/contracts/${id}`)
      console.log('getContract - Raw API response data:', data)
      
      // Handle both response formats:
      // 1. Wrapped format: { success: true, data: {...} }
      // 2. Direct format: { _id: '...', title: '...', content: [...] }
      let contract: any
      let isWrapped = false
      
      if (data.success && data.data) {
        // Wrapped format
        contract = data.data
        isWrapped = true
      } else if (data._id || data.id) {
        // Direct format - contract is the response itself
        contract = data
      } else {
        throw new Error('Invalid response format')
      }
      
      // Convert content to BlockNote format if needed
      if (contract.content) {
        console.log('getContract - Original content:', contract.content)
        contract.content = convertContentToBlockNote(contract.content)
        console.log('getContract - Converted content:', contract.content)
      }
      
      // Map _id to id for consistency
      if (contract._id && !contract.id) {
        contract.id = contract._id
      }
      
      // Return in consistent format
      if (isWrapped) {
        data.data = contract
        return data
      } else {
        return {
          success: true,
          data: contract,
        }
      }
    } catch (error: any) {
      // If API fails (CORS, network error, etc.), return mock data for frontend development
      console.warn('API call failed, using mock data:', error.message)
      
      // Return mock contract data in BlockNote format (PartialBlock[])
      // This matches what the contract page expects
      const mockContract: any = {
        id: id || '123',
        title: 'Untitled Agreement',
        content: [
          {
            type: 'heading',
            props: { level: 1 },
            content: [{ type: 'text', text: 'SERVICE AGREEMENT', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'This Service Agreement ("Agreement") is made on 20 November 2025', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Between', styles: { bold: true } }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Client:', styles: { bold: true } }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Name: Rahul Verma', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Company: Verma Digital Solutions Pvt. Ltd.', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Address: 22/4 Cyber Park, Gurgaon, Haryana - 122016', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Email: rahul.verma@vdigital.co', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Phone: 98765-43210', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'And', styles: { bold: true } }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Service Provider:', styles: { bold: true } }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Name: Divyanshi Sachan', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Business Name: DS Web & AI Solutions', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Address: B-32 Knowledge Park, Noida, Uttar Pradesh - 201301', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Email: contact@ds-solutions.in', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Phone: 91234-56789', styles: {} }],
          },
          {
            type: 'heading',
            props: { level: 2 },
            content: [{ type: 'text', text: '1. PROJECT OVERVIEW', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'The Client hires the Service Provider to design and develop a responsive website for Verma Digital Solutions, including AI-powered lead generation and CRM integration.', styles: {} }],
          },
          {
            type: 'heading',
            props: { level: 2 },
            content: [{ type: 'text', text: '2. SCOPE OF WORK', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'UI/UX design for 5 web pages (Home, Services, About, Careers, Contact).', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Complete frontend development using React.js and Tailwind CSS.', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Backend API integration using Express.js and Prisma ORM.', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'AI chatbot integration using Vapi AI.', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Deployment on AWS and domain setup.', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Basic SEO setup (metadata, sitemap, indexing settings).', styles: {} }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Deliverables will be shared via GitHub repository and deployment link.', styles: {} }],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'mock-user-id',
        status: 'draft' as const,
      }

      return {
        success: true,
        data: mockContract,
        message: 'Using mock data (API unavailable)',
      }
    }
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
    try {
      const { data } = await apiClient.patch(`/contracts/${id}/autosave`, updates)
      return data
    } catch (error: any) {
      // If API fails, just log and return success (for frontend-only mode)
      console.warn('Auto-save failed (using mock mode):', error.message)
      return {
        success: true,
        data: {
          id,
          title: 'Untitled Agreement',
          content: updates.content as any,
          createdAt: new Date().toISOString(),
          updatedAt: updates.lastModified,
          status: 'draft' as const,
        } as Contract,
        message: 'Auto-save disabled (API unavailable)',
      }
    }
  },

  async deleteContract(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete(`/contracts/${id}`)
    return data
  },

  async generateContract(prompt: string): Promise<GenerateContractResponse> {
    console.log('contractService.generateContract called with prompt:', prompt)
    try {
      // Disable timeout for contract generation as it can take longer than 30 seconds
      const response = await apiClient.post('/contracts/generate', { prompt }, {
        timeout: 0 // 0 means no timeout
      })
      console.log('contractService.generateContract - Raw API response:', response)
      console.log('contractService.generateContract - Response data:', response.data)
      
      // Convert content to BlockNote format if needed
      if (response.data?.success && response.data?.data?.content) {
        console.log('generateContract - Original content:', response.data.data.content)
        response.data.data.content = convertContentToBlockNote(
          response.data.data.content
        )
        console.log('generateContract - Converted content:', response.data.data.content)
      }
      
      // Map _id to id for consistency
      if (response.data?.data?._id && !response.data.data.id) {
        response.data.data.id = response.data.data._id
      }
      
      return response.data
    } catch (error) {
      console.error('contractService.generateContract - Error:', error)
      throw error
    }
  },

  async downloadContract(id: string): Promise<Blob> {
    const { data } = await apiClient.get(`/contracts/${id}/download`, {
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

