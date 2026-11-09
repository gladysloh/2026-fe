import { Button } from '../ui/Button'
import styles from './DashboardError.module.css'

interface DashboardErrorProps {
  onRetry: () => void
}

export function DashboardError({ onRetry }: DashboardErrorProps) {
  return (
    <div className={styles.container} role="alert">
      <p className={styles.message}>We couldn't load your dashboard.</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  )
}
