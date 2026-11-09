import styles from './Skeleton.module.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
  className?: string
}

export function Skeleton({
  width = '100%',
  height = '1em',
  borderRadius,
  className,
}: SkeletonProps) {
  return (
    <span
      className={[styles.skeleton, className].filter(Boolean).join(' ')}
      style={{
        width,
        height,
        borderRadius,
      }}
      aria-hidden="true"
    />
  )
}
