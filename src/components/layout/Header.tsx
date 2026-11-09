import { SegmentSwitch } from '../ui/SegmentSwitch'
import { ThemeToggle } from '../ui/ThemeToggle'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.logo}>Meridian</span>
          <nav className={styles.nav} aria-label="Main navigation">
            <a href="#" className={styles.navLinkActive} aria-current="page">
              Overview
            </a>
            <a
              href="#"
              className={styles.navLink}
              aria-disabled="true"
              onClick={(e) => e.preventDefault()}
            >
              Cards
            </a>
            <a
              href="#"
              className={styles.navLink}
              aria-disabled="true"
              onClick={(e) => e.preventDefault()}
            >
              Payments
            </a>
            <a
              href="#"
              className={styles.navLink}
              aria-disabled="true"
              onClick={(e) => e.preventDefault()}
            >
              Insights
            </a>
          </nav>
        </div>
        <div className={styles.right}>
          <div className={styles.segmentDesktop}>
            <SegmentSwitch />
          </div>
          <ThemeToggle />
          <div className={styles.avatar} aria-label="Account: Ava Chen">
            AC
          </div>
        </div>
      </div>
    </header>
  )
}
