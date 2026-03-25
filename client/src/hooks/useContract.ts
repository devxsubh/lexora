import { useState, useCallback } from 'react'
import { contractService } from '@/services/api/contracts'
import type { Contract } from '@/types/contract'

export const useContract = (contractId?: string) => {
  const [contract, setContract] = useState<Contract | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadContract = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await contractService.getContract(id)
      setContract(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contract')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateContract = useCallback(
    async (updates: Partial<Contract>) => {
      if (!contract) return
      setIsLoading(true)
      setError(null)
      try {
        const res = await contractService.updateContract(contract.id, updates)
        setContract(res.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update contract')
      } finally {
        setIsLoading(false)
      }
    },
    [contract]
  )

  const generateContract = useCallback(async (prompt: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await contractService.generateContract(prompt)
      setContract(res.data)
      return res
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate contract')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    contract,
    isLoading,
    error,
    loadContract,
    updateContract,
    generateContract,
  }
}

