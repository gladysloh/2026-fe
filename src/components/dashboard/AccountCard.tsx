import type { Account } from '../../api/types'
import { formatMoney } from '../../lib/format'
import styles from './AccountCard.module.css'

interface AccountCardProps {
  account: Account
}

export function AccountCard({ account }: AccountCardProps) {
  const isCredit = account.type === 'credit'

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.name}>{account.name}</span>
        {isCredit && <span className={styles.badge}>Amount due</span>}
      </div>
      <span className={styles.masked}>{account.maskedNumber}</span>
      <span className={`${styles.balance} amount`}>{formatMoney(account.balance)}</span>
    </div>
  )
}
