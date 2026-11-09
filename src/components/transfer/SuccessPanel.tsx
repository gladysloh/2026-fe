import { CheckCircle } from 'lucide-react'
import type { Transfer } from '../../api/types'
import { formatMoney } from '../../lib/format'
import { Button } from '../ui/Button'
import styles from './SuccessPanel.module.css'

interface SuccessPanelProps {
  transfer: Transfer
  onClose: () => void
}

export function SuccessPanel({ transfer, onClose }: SuccessPanelProps) {
  return (
    <div className={styles.container} aria-live="polite" aria-label="Transfer successful">
      <CheckCircle size={56} className={styles.icon} aria-hidden="true" />
      <h2 className={styles.title}>Transfer sent</h2>
      <p className={`${styles.amount} amount`}>{formatMoney(transfer.amount)}</p>
      <p className={styles.recipient}>
        to {transfer.recipient.name} · {transfer.recipient.bank} · {transfer.recipient.accountNumberMasked}
      </p>
      <div className={styles.reference}>
        <span className={styles.referenceLabel}>Reference</span>
        <span className={styles.referenceValue}>{transfer.reference}</span>
      </div>
      <p className={styles.message}>The money should arrive within minutes.</p>
      <Button onClick={onClose} fullWidth>
        Back to dashboard
      </Button>
    </div>
  )
}
