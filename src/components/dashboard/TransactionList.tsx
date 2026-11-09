import { useEffect, useState } from 'react'
import type { Transaction } from '../../api/types'
import { useTransactions } from '../../hooks/useTransactions'
import { Button } from '../ui/Button'
import { Skeleton } from '../ui/Skeleton'
import { SearchInput } from './SearchInput'
import { TransactionRow } from './TransactionRow'
import styles from './TransactionList.module.css'

export function TransactionList() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading } = useTransactions({
    limit: 8,
    q: debouncedSearch || undefined,
  })

  const transactions: Transaction[] = data?.transactions ?? []
  const hasSearch = debouncedSearch.length > 0
  const isEmpty = !isLoading && hasSearch && transactions.length === 0

  return (
    <section aria-label="Recent transactions">
      <div className={styles.header}>
        <h2 className={styles.heading}>Recent transactions</h2>
        <SearchInput value={searchInput} onChange={setSearchInput} />
      </div>

      {hasSearch && !isLoading && transactions.length > 0 && (
        <p className={styles.resultCount}>{transactions.length} result{transactions.length !== 1 ? 's' : ''}</p>
      )}

      <div className={styles.list}>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow}>
              <div className={styles.skeletonLeft}>
                <Skeleton height={14} width="55%" />
                <Skeleton height={12} width="35%" />
              </div>
              <Skeleton height={14} width={72} />
            </div>
          ))
        ) : isEmpty ? (
          <div className={styles.empty}>
            <p>No transactions match your search.</p>
            <Button variant="secondary" onClick={() => setSearchInput('')}>
              Clear search
            </Button>
          </div>
        ) : (
          transactions.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)
        )}
      </div>
    </section>
  )
}
