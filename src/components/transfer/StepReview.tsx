import type { UseFormReturn } from 'react-hook-form'
import type { Account, Payee } from '../../api/types'
import { formatMoney } from '../../lib/format'
import { Button } from '../ui/Button'
import type { TransferFormValues } from './TransferDialog'
import styles from './StepReview.module.css'

interface StepReviewProps {
  form: UseFormReturn<TransferFormValues>
  accounts: Account[]
  payees: Payee[]
  isPending: boolean
  error: string | null
  onBack: () => void
  onConfirm: () => void
}

export function StepReview({
  form,
  accounts,
  payees,
  isPending,
  error,
  onBack,
  onConfirm,
}: StepReviewProps) {
  const values = form.getValues()
  const fromAccount = accounts.find((a) => a.id === values.fromAccountId)
  const selectedPayee = payees.find((p) => p.id === values.payeeId)
  const amount = Number(values.amount) || 0

  const recipientName = selectedPayee?.name ?? values.recipientName
  const recipientBank = selectedPayee?.bank ?? values.recipientBank
  const recipientMasked = selectedPayee
    ? selectedPayee.accountNumberMasked
    : `•••• ${values.recipientAccountNumber?.slice(-4)}`

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Check the details</h2>

      {error && (
        <div className={styles.errorAlert} role="alert">
          {error}
        </div>
      )}

      <dl className={styles.summary}>
        <div className={styles.row}>
          <dt className={styles.dt}>From</dt>
          <dd className={styles.dd}>
            {fromAccount?.name} · {fromAccount?.maskedNumber}
          </dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.dt}>To</dt>
          <dd className={styles.dd}>
            {recipientName} · {recipientBank} · {recipientMasked}
          </dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.dt}>Amount</dt>
          <dd className={`${styles.dd} amount`}>{formatMoney(amount)}</dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.dt}>Fee</dt>
          <dd className={`${styles.dd} amount`}>SGD 0.00</dd>
        </div>
        {values.note && (
          <div className={styles.row}>
            <dt className={styles.dt}>Note</dt>
            <dd className={styles.dd}>{values.note}</dd>
          </div>
        )}
        <div className={`${styles.row} ${styles.total}`}>
          <dt className={styles.dt}>Total</dt>
          <dd className={`${styles.dd} amount`}>{formatMoney(amount)}</dd>
        </div>
      </dl>

      <p className={styles.info}>Usually arrives in minutes.</p>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button onClick={onConfirm} disabled={isPending} fullWidth>
          {isPending ? 'Sending…' : 'Confirm transfer'}
        </Button>
      </div>
    </div>
  )
}
