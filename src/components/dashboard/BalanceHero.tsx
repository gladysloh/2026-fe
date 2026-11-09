import type { Account } from '../../api/types'
import { formatMoney } from '../../lib/format'
import { Button } from '../ui/Button'
import { Skeleton } from '../ui/Skeleton'
import styles from './BalanceHero.module.css'

interface BalanceHeroProps {
  accounts?: Account[]
  isLoading?: boolean
  onNewTransfer?: () => void
}

export function BalanceHero({ accounts, isLoading, onNewTransfer }: BalanceHeroProps) {
  const depositAccounts = accounts?.filter((a) => a.type !== 'credit') ?? []
  const total = depositAccounts.reduce((sum, a) => sum + a.balance, 0)

  return (
    <section className={styles.hero} aria-label="Total available balance">
      <div className={styles.content}>
        <div>
          <p className={styles.label}>Total available</p>
          {isLoading ? (
            <Skeleton width={220} height={48} className={styles.skeleton} />
          ) : (
            <p className={`${styles.amount} amount`}>{formatMoney(total)}</p>
          )}
          <p className={styles.caption}>Across {depositAccounts.length} deposit accounts</p>
        </div>
        <div className={styles.action}>
          <Button onClick={onNewTransfer} disabled={isLoading}>
            New transfer
          </Button>
        </div>
      </div>
    </section>
  )
}
