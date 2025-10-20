import { useEffect, useState } from 'react'

function getStoredTheme(): 'light' | 'dark' | null {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem('theme')
  return stored === 'light' || stored === 'dark' ? stored : null
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  const prefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = getStoredTheme()
    return stored || getSystemTheme()
  })

  const [hasManualOverride, setHasManualOverride] = useState<boolean>(() => {
    return getStoredTheme() !== null
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      if (!hasManualOverride) {
        const newTheme = e.matches ? 'dark' : 'light'
        setTheme(newTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [hasManualOverride])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleVisibilityChange = () => {
      if (!document.hidden && !hasManualOverride) {
        const currentSystemTheme = getSystemTheme()
        if (currentSystemTheme !== theme) {
          setTheme(currentSystemTheme)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [hasManualOverride, theme])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggle = () => {
    setHasManualOverride(true)
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark'
      window.localStorage.setItem('theme', newTheme)
      return newTheme
    })
  }

  return { theme, toggle }
}
