import { X } from 'lucide-react'
import styles from './SearchInput.module.css'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className={styles.wrapper}>
      <input
        className={styles.input}
        type="search"
        placeholder="Search transactions"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search transactions"
      />
      {value && (
        <button
          className={styles.clear}
          onClick={() => onChange('')}
          aria-label="Clear search"
          type="button"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
