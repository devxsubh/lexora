import { apiClient } from './client'

type ApiResponse<T> = { success: boolean; data: T; message?: string }

export type ShareRole = 'viewer' | 'editor'
export type GeneralAccess = 'restricted' | 'anyone-with-link'

export type ContractShare = {
  id: string
  contractId: string
  email: string
  userId?: string
  role: ShareRole
  addedBy: string
  createdAt?: string
  updatedAt?: string
}

export type ListSharesResult = {
  generalAccess: GeneralAccess
  shares: ContractShare[]
}

export const sharesService = {
  async list(contractId: string): Promise<ListSharesResult> {
    const { data } = await apiClient.get<ApiResponse<ListSharesResult>>(`/contracts/${contractId}/shares`)
    return data.data
  },

  async add(contractId: string, email: string, role: ShareRole): Promise<ContractShare> {
    const { data } = await apiClient.post<ApiResponse<ContractShare>>(`/contracts/${contractId}/shares`, { email, role })
    return data.data
  },

  async updateRole(contractId: string, shareId: string, role: ShareRole): Promise<ContractShare> {
    const { data } = await apiClient.patch<ApiResponse<ContractShare>>(`/contracts/${contractId}/shares/${shareId}`, { role })
    return data.data
  },

  async remove(contractId: string, shareId: string): Promise<void> {
    await apiClient.delete(`/contracts/${contractId}/shares/${shareId}`)
  },

  async updateGeneralAccess(contractId: string, generalAccess: GeneralAccess): Promise<{ generalAccess: GeneralAccess }> {
    const { data } = await apiClient.patch<ApiResponse<{ generalAccess: GeneralAccess }>>(
      `/contracts/${contractId}/shares/general-access`,
      { generalAccess }
    )
    return data.data
  },
}

