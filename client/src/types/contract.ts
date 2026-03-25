export interface ContractBlock {
  id?: string
  type: string
  props?: Record<string, unknown>
  content?: Array<{ type: string; text: string; styles?: Record<string, unknown> }>
  children?: ContractBlock[]
}

export interface Contract {
  id: string
  title: string
  content: ContractBlock[]
  status: 'draft' | 'reviewing' | 'finalized'
  userId?: string
  lexiId?: string
  metadata?: Record<string, unknown>
  isFavorite?: boolean
  party?: string
  contractType?: string
  aiRiskScore?: number
  riskLevel?: 'Low' | 'Medium' | 'High'
  lifecycleStage?: number
  effectiveDate?: string
  summary?: string
  createdAt: string
  updatedAt: string
}
