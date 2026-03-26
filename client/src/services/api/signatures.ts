import { apiClient } from './client'

type ApiResponse<T> = { success: boolean; data: T; message?: string }

export type SignatureSigner = {
  name: string
  email: string
}

export type SignatureRequestResult = {
  requestId: string
  status: string
  sentTo: string[]
}

export type SignatureRequest = Record<string, unknown>

export const signatureService = {
  async requestSignatures(
    contractId: string,
    signers: SignatureSigner[],
    message?: string
  ): Promise<SignatureRequestResult> {
    const { data } = await apiClient.post<ApiResponse<SignatureRequestResult>>(
      `/signatures/${contractId}/signatures/request`,
      { signers, message }
    )
    return data.data
  },

  async listSignatures(contractId: string): Promise<SignatureRequest[]> {
    const { data } = await apiClient.get<ApiResponse<SignatureRequest[]>>(`/signatures/${contractId}/signatures`)
    return data.data
  },

  async signDocument(params: {
    contractId: string
    signature: string
    signerName: string
    requestId?: string
  }): Promise<any> {
    const { contractId, ...payload } = params
    const { data } = await apiClient.post<ApiResponse<any>>(`/signatures/${contractId}/sign`, payload)
    return data.data
  },
}

