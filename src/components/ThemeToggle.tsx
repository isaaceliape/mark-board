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

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Get theme from localStorage first, then system preference
    const stored = getStoredTheme()
    return stored || getSystemTheme()
  })

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      const stored = getStoredTheme()
      if (!stored) {
        const newTheme = e.matches ? 'dark' : 'light'
        setTheme(newTheme)
      }
    }

    // Modern browsers support addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggle = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark'
      // Save manual preference to localStorage
      window.localStorage.setItem('theme', newTheme)
      return newTheme
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      }
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
    >
      {theme === 'dark' ? (
        // Sun icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
          <path
            fillRule="evenodd"
            d="M12 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm10-7a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM7 12a1 1 0 01-1 1H4a1 1 0 110-2h2a1 1 0 011 1zm11.657-6.657a1 1 0 010 1.414L17.243 8.17a1 1 0 11-1.414-1.415l1.414-1.414a1 1 0 011.414 0zM8.17 17.243a1 1 0 010 1.414L6.757 20.07a1 1 0 11-1.414-1.415l1.414-1.414a1 1 0 011.414 0zM20.071 17.243a1 1 0 00-1.414 0l-1.414 1.414a1 1 0 001.414 1.414l1.414-1.414a1 1 0 000-1.414zM7.757 3.515a1 1 0 00-1.414 0L4.93 4.93A1 1 0 106.343 6.343L7.757 4.93a1 1 0 000-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        // Moon icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
        </svg>
      )}
      <span className="text-sm hidden sm:inline">
        {theme === 'dark' ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}
