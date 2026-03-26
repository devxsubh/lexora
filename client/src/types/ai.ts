export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  contractUpdated?: boolean
  updatedContent?: any[]
  citations?: ChatCitation[]
}

export interface ChatCitation {
  startLine: number
  endLine: number
  quote: string
}

export interface AIReviewIssue {
  id: string
  type: 'risk' | 'missing' | 'inconsistency' | 'suggestion'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  location?: {
    blockId: string
    line?: number
  }
  suggestion?: string
}

