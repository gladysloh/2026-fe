import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { TransactionsResponse } from '../api/types'

interface TransactionParams {
  limit?: number
  q?: string
}

export function useTransactions(params?: TransactionParams) {
  const searchParams = new URLSearchParams()
  if (params?.limit != null) searchParams.set('limit', String(params.limit))
  if (params?.q) searchParams.set('q', params.q)
  const qs = searchParams.toString()

  return useQuery({
    queryKey: ['transactions', params ?? {}],
    queryFn: () =>
      apiFetch<TransactionsResponse>(
        `/api/transactions${qs ? `?${qs}` : ''}`,
      ),
  })
}
