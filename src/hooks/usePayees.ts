import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { PayeesResponse } from '../api/types'

export function usePayees() {
  return useQuery({
    queryKey: ['payees'],
    queryFn: () => apiFetch<PayeesResponse>('/api/payees'),
  })
}
