import type { Segment } from '../api/types'

type Theme = 'light' | 'dark'

function getTheme(): Theme {
  return (document.documentElement.getAttribute('data-theme') as Theme) ?? 'light'
}

function getSegment(): Segment {
  return (document.documentElement.getAttribute('data-segment') as Segment) ?? 'retail'
}

function setTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('meridian-theme', theme)
}

function setSegmentAttr(segment: Segment) {
  document.documentElement.setAttribute('data-segment', segment)
  localStorage.setItem('meridian-segment', segment)
}

import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-segment'],
  })
  return () => observer.disconnect()
}

function getSnapshot() {
  return `${getTheme()}:${getSegment()}`
}

export function useTheme() {
  useSyncExternalStore(subscribe, getSnapshot)

  const theme = getTheme()
  const segment = getSegment()

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  function setSegment(s: Segment) {
    setSegmentAttr(s)
  }

  return { theme, segment, toggleTheme, setSegment }
}
