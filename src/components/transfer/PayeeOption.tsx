import type { Payee } from '../../api/types'
import styles from './PayeeOption.module.css'

interface PayeeOptionProps {
  payee: Payee
  selected: boolean
  onSelect: (payee: Payee) => void
}

export function PayeeOption({ payee, selected, onSelect }: PayeeOptionProps) {
  return (
    <button
      type="button"
      className={[styles.option, selected ? styles.selected : ''].filter(Boolean).join(' ')}
      onClick={() => onSelect(payee)}
      aria-pressed={selected}
    >
      <span className={styles.initials}>{payee.initials}</span>
      <div className={styles.info}>
        <span className={styles.name}>{payee.name}</span>
        <span className={styles.detail}>
          {payee.bank} · {payee.accountNumberMasked}
        </span>
      </div>
    </button>
  )
}
