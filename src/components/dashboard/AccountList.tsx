import type { Account } from '../../api/types'
import { Skeleton } from '../ui/Skeleton'
import { AccountCard } from './AccountCard'
import styles from './AccountList.module.css'

interface AccountListProps {
  accounts?: Account[]
  isLoading?: boolean
}

export function AccountList({ accounts, isLoading }: AccountListProps) {
  return (
    <section aria-label="Accounts">
      <h2 className={styles.heading}>Accounts</h2>
      <div className={styles.list}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <Skeleton height={16} width="60%" />
                <Skeleton height={12} width="40%" />
                <Skeleton height={24} width="80%" />
              </div>
            ))
          : accounts?.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
      </div>
    </section>
  )
}
