import type { Transaction } from '../../api/types'
import { formatMoney, formatShortDate } from '../../lib/format'
import styles from './TransactionRow.module.css'

interface TransactionRowProps {
  transaction: Transaction
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const isIn = transaction.direction === 'in'
  const isPending = transaction.status === 'pending'
  const amountDisplay = `${isIn ? '+' : '-'}${formatMoney(transaction.amount)}`

  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <span className={styles.description}>{transaction.description}</span>
        <span className={styles.meta}>
          {transaction.category} · {formatShortDate(transaction.date)}
        </span>
      </div>
      <div className={styles.right}>
        <span className={`${styles.amount} ${isIn ? styles.positive : ''} amount`}>
          {amountDisplay}
        </span>
        {isPending && <span className={styles.pending}>Pending</span>}
      </div>
    </div>
  )
}
