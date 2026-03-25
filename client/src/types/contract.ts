export type BlockType = 'paragraph' | 'heading' | 'list' | 'clause' | 'section'

export interface ContractBlock {
  id: string
  type: BlockType
  content: string
  metadata: {
    level?: number // for headings
    listType?: 'ordered' | 'unordered' // for lists
    clauseId?: string // if from clause library
    [key: string]: any
  }
}

export interface Contract {
  id: string
  title: string
  content: ContractBlock[]
  createdAt: string
  updatedAt: string
  status: 'draft' | 'reviewing' | 'finalized'
  metadata?: {
    parties?: string[]
    type?: string
    [key: string]: any
  }
}

