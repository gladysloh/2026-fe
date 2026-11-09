import type { Customer } from '../../api/types'
import { formatMoney } from '../../lib/format'
import { Skeleton } from '../ui/Skeleton'
import styles from './DailyLimitCard.module.css'

interface DailyLimitCardProps {
  customer?: Customer
  isLoading?: boolean
}

export function DailyLimitCard({ customer, isLoading }: DailyLimitCardProps) {
  const limit = customer?.dailyTransferLimit ?? 0
  const used = customer?.transferredToday ?? 0
  const remaining = limit - used
  const usedPercent = limit > 0 ? (used / limit) * 100 : 0

  return (
    <aside className={styles.card} aria-label="Daily transfer limit">
      <h2 className={styles.heading}>Daily limit</h2>
      {isLoading ? (
        <>
          <Skeleton height={28} width="80%" />
          <Skeleton height={8} width="100%" className={styles.barSkeleton} />
        </>
      ) : (
        <>
          <p className={`${styles.remaining} amount`}>{formatMoney(remaining)}</p>
          <p className={styles.sub}>remaining today</p>
          <div className={styles.barTrack} role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={limit} aria-label={`${formatMoney(used)} of ${formatMoney(limit)} used`}>
            <div
              className={styles.barFill}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </>
      )}
      <p className={styles.caption}>Resets daily. Applies to all transfers.</p>
    </aside>
  )
}
