import { create } from 'zustand'

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

interface ThemeState {
  theme: 'light' | 'dark'
  hasManualOverride: boolean
  toggle: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const stored = getStoredTheme()
  const initialTheme = stored || getSystemTheme()
  const initialHasManualOverride = stored !== null

  if (typeof window !== 'undefined') {
    const root = document.documentElement
    if (initialTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!get().hasManualOverride) {
        const newTheme = e.matches ? 'dark' : 'light'
        get().setTheme(newTheme)
      }
    }
    mediaQuery.addEventListener('change', handleChange)

    const handleVisibilityChange = () => {
      if (!document.hidden && !get().hasManualOverride) {
        const currentSystemTheme = getSystemTheme()
        if (currentSystemTheme !== get().theme) {
          get().setTheme(currentSystemTheme)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  return {
    theme: initialTheme,
    hasManualOverride: initialHasManualOverride,

    toggle: () => {
      set({ hasManualOverride: true })
      const newTheme = get().theme === 'dark' ? 'light' : 'dark'
      window.localStorage.setItem('theme', newTheme)
      get().setTheme(newTheme)
    },

    setTheme: (theme: 'light' | 'dark') => {
      set({ theme })
      const root = document.documentElement
      if (theme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    },
  }
})
