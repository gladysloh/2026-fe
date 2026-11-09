import type { UseFormReturn } from 'react-hook-form'
import type { Account } from '../../api/types'
import { formatMoney } from '../../lib/format'
import { makeAmountSchema, noteSchema } from '../../schemas/transfer'
import type { TransferFormValues } from './TransferDialog'
import styles from './StepAmount.module.css'

interface StepAmountProps {
  form: UseFormReturn<TransferFormValues>
  accounts: Account[]
  dailyRemaining: number
}

const QUICK_AMOUNTS = [50, 100, 250, 500]

export function StepAmount({ form, accounts, dailyRemaining }: StepAmountProps) {
  const { register, formState: { errors }, setValue, watch, setError, clearErrors } = form
  const depositAccounts = accounts.filter((a) => a.type !== 'credit')
  const selectedAccountId = watch('fromAccountId')
  const noteValue = watch('note') ?? ''
  const selectedAccount = depositAccounts.find((a) => a.id === selectedAccountId) ?? depositAccounts[0]

  function handleAmountBlur(e: React.FocusEvent<HTMLInputElement>) {
    const balance = selectedAccount?.balance ?? 0
    const result = makeAmountSchema(balance, dailyRemaining).safeParse(e.target.value)
    if (!result.success) {
      setError('amount', { message: result.error.issues[0]?.message })
    } else {
      clearErrors('amount')
    }
  }

  function handleNoteBlur(e: React.FocusEvent<HTMLInputElement>) {
    const result = noteSchema.safeParse(e.target.value)
    if (!result.success) {
      setError('note', { message: result.error.issues[0]?.message })
    } else {
      clearErrors('note')
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>How much?</h2>

      <div className={styles.field}>
        <label htmlFor="fromAccountId" className={styles.label}>
          From account
        </label>
        <select
          id="fromAccountId"
          className={styles.select}
          aria-describedby={errors.fromAccountId ? 'fromAccountId-error' : undefined}
          aria-invalid={!!errors.fromAccountId}
          {...register('fromAccountId')}
        >
          {depositAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} · {account.maskedNumber}
            </option>
          ))}
        </select>
        <span className={styles.hint}>Deposit accounts only</span>
        {errors.fromAccountId && (
          <span id="fromAccountId-error" className={styles.error} role="alert">
            {errors.fromAccountId.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="amount" className={styles.label}>
          Amount
        </label>
        <div className={styles.amountWrapper}>
          <span className={styles.currency}>SGD</span>
          <input
            id="amount"
            className={styles.amountInput}
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            aria-describedby={errors.amount ? 'amount-error' : 'amount-hint'}
            aria-invalid={!!errors.amount}
            {...register('amount', { onBlur: handleAmountBlur })}
          />
        </div>
        <div className={styles.quickPicks}>
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              className={styles.quickPick}
              onClick={() => setValue('amount', String(amt), { shouldValidate: true })}
            >
              {amt}
            </button>
          ))}
        </div>
        <div id="amount-hint" className={styles.hints}>
          {selectedAccount && (
            <>
              <span>Available <span className="amount">{formatMoney(selectedAccount.balance)}</span></span>
              <span>Remaining daily limit <span className="amount">{formatMoney(dailyRemaining)}</span></span>
            </>
          )}
        </div>
        {errors.amount && (
          <span id="amount-error" className={styles.error} role="alert">
            {errors.amount.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.noteHeader}>
          <label htmlFor="note" className={styles.label}>
            Note <span className={styles.optional}>(optional)</span>
          </label>
          <span className={styles.counter} aria-live="polite">
            {noteValue.length}/50
          </span>
        </div>
        <input
          id="note"
          className={styles.input}
          type="text"
          maxLength={50}
          placeholder="Add a note"
          aria-describedby={errors.note ? 'note-error' : undefined}
          aria-invalid={!!errors.note}
          {...register('note', { onBlur: handleNoteBlur })}
        />
        {errors.note && (
          <span id="note-error" className={styles.error} role="alert">
            {errors.note.message}
          </span>
        )}
      </div>
    </div>
  )
}
