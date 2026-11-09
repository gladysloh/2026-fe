import type { Segment } from '../../api/types'
import { useTheme } from '../../hooks/useTheme'
import styles from './SegmentSwitch.module.css'

export function SegmentSwitch() {
  const { segment, setSegment } = useTheme()

  return (
    <div className={styles.switch} role="group" aria-label="Customer segment">
      <button
        className={styles.option}
        aria-pressed={segment === 'retail'}
        onClick={() => setSegment('retail' as Segment)}
      >
        Retail
      </button>
      <button
        className={styles.option}
        aria-pressed={segment === 'premium'}
        onClick={() => setSegment('premium' as Segment)}
      >
        Premium
      </button>
    </div>
  )
}
