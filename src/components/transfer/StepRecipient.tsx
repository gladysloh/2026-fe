import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { Payee } from '../../api/types'
import { usePayees } from '../../hooks/usePayees'
import { BANKS, recipientSchema } from '../../schemas/transfer'
import { Skeleton } from '../ui/Skeleton'
import { PayeeOption } from './PayeeOption'
import type { TransferFormValues } from './TransferDialog'
import styles from './StepRecipient.module.css'

interface StepRecipientProps {
  form: UseFormReturn<TransferFormValues>
}

export function StepRecipient({ form }: StepRecipientProps) {
  const { data, isLoading } = usePayees()
  const payees = data?.payees ?? []
  const [showNewRecipient, setShowNewRecipient] = useState(false)
  const [search, setSearch] = useState('')
  const { register, formState: { errors }, setValue, watch, setError, clearErrors } = form

  function validateFieldOnBlur(field: 'recipientName' | 'recipientAccountNumber' | 'recipientBank', value: string) {
    const schemaField = field === 'recipientName' ? 'name' : field === 'recipientAccountNumber' ? 'accountNumber' : 'bank'
    const result = recipientSchema.shape[schemaField].safeParse(value)
    if (!result.success) {
      setError(field, { message: result.error.issues[0]?.message })
    } else {
      clearErrors(field)
    }
  }
  const selectedPayeeId = watch('payeeId')

  const filteredPayees = search
    ? payees.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : payees

  function handleSelectPayee(payee: Payee) {
    setValue('payeeId', payee.id)
    setValue('recipientName', '')
    setValue('recipientAccountNumber', '')
    setValue('recipientBank', '')
    setShowNewRecipient(false)
  }

  function handleNewRecipient() {
    setValue('payeeId', '')
    setShowNewRecipient(true)
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Who are you sending to?</h2>

      <div className={styles.searchWrapper}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search payees"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search payees"
        />
      </div>

      <div className={styles.payeeList} role="list">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={64} className={styles.payeeSkeleton} />
          ))
        ) : filteredPayees.length > 0 ? (
          filteredPayees.map((payee) => (
            <div key={payee.id} role="listitem">
              <PayeeOption
                payee={payee}
                selected={selectedPayeeId === payee.id}
                onSelect={handleSelectPayee}
              />
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No payees found.</p>
        )}
      </div>

      <button
        type="button"
        className={[styles.newRecipientToggle, showNewRecipient ? styles.active : '']
          .filter(Boolean)
          .join(' ')}
        onClick={handleNewRecipient}
        aria-expanded={showNewRecipient}
      >
        + Send to someone new
      </button>

      {showNewRecipient && (
        <div className={styles.newRecipientForm}>
          <div className={styles.field}>
            <label htmlFor="recipientName" className={styles.label}>
              Recipient name
            </label>
            <input
              id="recipientName"
              className={styles.input}
              type="text"
              placeholder="Full name"
              aria-describedby={errors.recipientName ? 'recipientName-error' : undefined}
              aria-invalid={!!errors.recipientName}
              {...register('recipientName', { onBlur: (e) => validateFieldOnBlur('recipientName', e.target.value) })}
            />
            {errors.recipientName && (
              <span id="recipientName-error" className={styles.error} role="alert">
                {errors.recipientName.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="recipientAccountNumber" className={styles.label}>
              Account number
            </label>
            <input
              id="recipientAccountNumber"
              className={styles.input}
              type="text"
              inputMode="numeric"
              maxLength={8}
              placeholder="8-digit account number"
              aria-describedby={errors.recipientAccountNumber ? 'recipientAccountNumber-error' : undefined}
              aria-invalid={!!errors.recipientAccountNumber}
              {...register('recipientAccountNumber', { onBlur: (e) => validateFieldOnBlur('recipientAccountNumber', e.target.value) })}
            />
            {errors.recipientAccountNumber && (
              <span id="recipientAccountNumber-error" className={styles.error} role="alert">
                {errors.recipientAccountNumber.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="recipientBank" className={styles.label}>
              Bank
            </label>
            <select
              id="recipientBank"
              className={styles.select}
              aria-describedby={errors.recipientBank ? 'recipientBank-error' : undefined}
              aria-invalid={!!errors.recipientBank}
              {...register('recipientBank', { onBlur: (e) => validateFieldOnBlur('recipientBank', e.target.value) })}
            >
              <option value="">Select a bank</option>
              {BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
            {errors.recipientBank && (
              <span id="recipientBank-error" className={styles.error} role="alert">
                {errors.recipientBank.message}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
