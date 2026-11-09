import styles from './Stepper.module.css'

const STEPS = ['Recipient', 'Amount', 'Review'] as const

interface StepperProps {
  currentStep: 1 | 2 | 3
}

export function Stepper({ currentStep }: StepperProps) {
  return (
    <nav className={styles.stepper} aria-label="Transfer steps">
      <ol className={styles.list}>
        {STEPS.map((label, i) => {
          const step = (i + 1) as 1 | 2 | 3
          const isCompleted = step < currentStep
          const isCurrent = step === currentStep

          return (
            <li
              key={label}
              className={[
                styles.step,
                isCompleted ? styles.completed : '',
                isCurrent ? styles.current : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className={styles.number}>{isCompleted ? '✓' : step}</span>
              <span className={styles.label}>{label}</span>
              {i < STEPS.length - 1 && <span className={styles.divider} aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
