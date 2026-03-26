import { apiClient } from './client'

type ApiResponse<T> = { success: boolean; data: T; message?: string }

export type DashboardMetrics = {
  totalContracts: number
  pendingSignatures: number
  expiringSoon: number
  aiRiskFlags: number
}

export type DashboardContractRow = {
  id: string
  name: string
  party: string
  contractType: string
  status: string
  aiRiskScore: number
  lastUpdated: string
  lastActivity: string
  riskLevel: 'Low' | 'Medium' | 'High'
  hasRiskFlag: boolean
  lifecycleStage: number
  effectiveDate: string | null
  summary: string
}

export type DashboardContractsResult = {
  contracts: DashboardContractRow[]
  total: number
  page: number
  limit: number
}

export type DashboardActivityItem = {
  id: string
  text: string
  time: string
  contractId?: string
  type?: string
}

export type DashboardInsight = {
  id: string
  title: string
  fix?: string
  action?: string
  actionLabel?: string
  href?: string
  contractId?: string
}

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const { data } = await apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics')
    return data.data
  },

  async getContracts(params?: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<DashboardContractsResult> {
    const { data } = await apiClient.get<ApiResponse<DashboardContractsResult>>('/dashboard/contracts', { params })
    return data.data
  },

  async getRecentActivity(limit?: number): Promise<DashboardActivityItem[]> {
    const { data } = await apiClient.get<ApiResponse<DashboardActivityItem[]>>('/dashboard/activity', {
      params: typeof limit === 'number' ? { limit } : undefined,
    })
    return data.data
  },

  async getAiInsights(): Promise<DashboardInsight[]> {
    const { data } = await apiClient.get<ApiResponse<DashboardInsight[]>>('/dashboard/ai-insights')
    return data.data
  },

  async getMetricItems(metricId: string): Promise<any[]> {
    const { data } = await apiClient.get<ApiResponse<any[]>>(`/dashboard/metrics/${metricId}/items`)
    return data.data
  },
}

