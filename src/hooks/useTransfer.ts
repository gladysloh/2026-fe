import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { CreateTransferRequest, TransferResponse } from '../api/types'

export function useTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransferRequest) =>
      apiFetch<TransferResponse>('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customer'] })
      void queryClient.invalidateQueries({ queryKey: ['accounts'] })
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
