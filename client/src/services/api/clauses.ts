import { apiClient } from './client'
import type { Clause } from '@/types/clause'

export const clauseService = {
  async getClauses(): Promise<Clause[]> {
    const { data } = await apiClient.get('/clauses')
    return data
  },

  async getClause(id: string): Promise<Clause> {
    const { data } = await apiClient.get(`/clauses/${id}`)
    return data
  },

  async createClause(clause: Partial<Clause>): Promise<Clause> {
    const { data } = await apiClient.post('/clauses', clause)
    return data
  },

  async updateClause(id: string, updates: Partial<Clause>): Promise<Clause> {
    const { data } = await apiClient.patch(`/clauses/${id}`, updates)
    return data
  },

  async deleteClause(id: string): Promise<void> {
    await apiClient.delete(`/clauses/${id}`)
  },
}

