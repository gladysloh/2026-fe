import { useRef, useState } from 'react'
import { useAccounts } from './hooks/useAccounts'
import { useCustomer } from './hooks/useCustomer'
import { usePayees } from './hooks/usePayees'
import { BalanceHero } from './components/dashboard/BalanceHero'
import { AccountList } from './components/dashboard/AccountList'
import { DailyLimitCard } from './components/dashboard/DailyLimitCard'
import { DashboardError } from './components/dashboard/DashboardError'
import { TransactionList } from './components/dashboard/TransactionList'
import { Header } from './components/layout/Header'
import { Button } from './components/ui/Button'
import { SegmentSwitch } from './components/ui/SegmentSwitch'
import { TransferDialog } from './components/transfer/TransferDialog'
import styles from './App.module.css'

export default function App() {
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const transferBtnRef = useRef<HTMLButtonElement>(null)

  function handleOpenTransfer() {
    setIsTransferOpen(true)
  }

  function handleCloseTransfer() {
    setIsTransferOpen(false)
    transferBtnRef.current?.focus()
  }
  const customerQuery = useCustomer()
  const accountsQuery = useAccounts()
  const payeesQuery = usePayees()

  const isLoading = customerQuery.isLoading || accountsQuery.isLoading
  const isError = customerQuery.isError || accountsQuery.isError

  function handleRetry() {
    void customerQuery.refetch()
    void accountsQuery.refetch()
  }

  const customer = customerQuery.data?.customer
  const accounts = accountsQuery.data?.accounts ?? []
  const payees = payeesQuery.data?.payees ?? []

  const dailyRemaining =
    customer != null ? customer.dailyTransferLimit - customer.transferredToday : 0

  return (
    <>
      <Header />

      <main className={styles.main}>
        {isError ? (
          <DashboardError onRetry={handleRetry} />
        ) : (
          <>
            {/* Mobile: greeting + segment switch above hero */}
            <div className={styles.mobileGreeting}>
              <div className={styles.greetingRow}>
                <p className={styles.greeting}>Good evening, Ava</p>
                <SegmentSwitch />
              </div>
            </div>

            <div className={styles.container}>
              {/* Desktop: greeting */}
              <div className={styles.desktopGreeting}>
                <p className={styles.greeting}>Good evening, Ava</p>
              </div>

              <div className={styles.grid}>
                <div className={styles.mainCol}>
                  <BalanceHero
                    accounts={accounts}
                    isLoading={isLoading}
                    onNewTransfer={handleOpenTransfer}
                  />
                  <AccountList accounts={accounts} isLoading={isLoading} />
                  <TransactionList />
                </div>

                <aside className={styles.rail}>
                  <DailyLimitCard customer={customer} isLoading={isLoading} />
                </aside>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Mobile fixed bottom CTA */}
      {!isError && (
        <div className={styles.mobileTransferBar}>
          <Button
            ref={transferBtnRef}
            onClick={handleOpenTransfer}
            fullWidth
            disabled={isLoading}
          >
            New transfer
          </Button>
        </div>
      )}

      {isTransferOpen && (
        <TransferDialog
          isOpen={isTransferOpen}
          onClose={handleCloseTransfer}
          accounts={accounts}
          payees={payees}
          dailyRemaining={dailyRemaining}
        />
      )}
    </>
  )
}
