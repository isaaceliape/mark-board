import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppTheme, getThemeById, getAutoTheme, allThemes } from '../themes'

interface ThemeState {
  // Current theme
  currentTheme: AppTheme
  customThemes: AppTheme[]

  // System preferences
  hasManualOverride: boolean

  // Actions
  setTheme: (themeId: string) => void
  setAutoTheme: () => void
  addCustomTheme: (theme: AppTheme) => void
  removeCustomTheme: (themeId: string) => void
  toggleTheme: () => void
  importITerm2Scheme: (schemeText: string) => void
  exportCurrentTheme: () => string
}

function getStoredThemeId(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('markboard-theme-id')
}

function applyThemeToDOM(theme: AppTheme) {
  if (typeof window === 'undefined') return

  const root = document.documentElement

  // Remove existing theme classes
  root.classList.remove('light', 'dark')

  // Apply theme class
  root.classList.add(theme.type === 'auto' ? 'light' : theme.type)

  // Apply CSS custom properties
  const cssProperties = generateCSSProperties(theme)
  Object.entries(cssProperties).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
}

function generateCSSProperties(theme: AppTheme): Record<string, string> {
  const { colors } = theme

  return {
    // Background colors
    '--color-bg-primary': colors.background.primary,
    '--color-bg-secondary': colors.background.secondary,
    '--color-bg-tertiary': colors.background.tertiary,
    '--color-bg-elevated': colors.background.elevated,

    // Text colors
    '--color-text-primary': colors.text.primary,
    '--color-text-secondary': colors.text.secondary,
    '--color-text-muted': colors.text.muted,
    '--color-text-inverse': colors.text.inverse,

    // Border colors
    '--color-border-light': colors.border.light,
    '--color-border-medium': colors.border.medium,
    '--color-border-dark': colors.border.dark,

    // Interactive colors
    '--color-interactive-hover': colors.interactive.hover,
    '--color-interactive-active': colors.interactive.active,
    '--color-interactive-focus': colors.interactive.focus,
    '--color-interactive-disabled': colors.interactive.disabled,

    // Status colors
    '--color-status-success': colors.status.success,
    '--color-status-warning': colors.status.warning,
    '--color-status-error': colors.status.error,
    '--color-status-info': colors.status.info,

    // Primary color scale
    '--color-primary-50': colors.primary[50],
    '--color-primary-100': colors.primary[100],
    '--color-primary-200': colors.primary[200],
    '--color-primary-300': colors.primary[300],
    '--color-primary-400': colors.primary[400],
    '--color-primary-500': colors.primary[500],
    '--color-primary-600': colors.primary[600],
    '--color-primary-700': colors.primary[700],
    '--color-primary-800': colors.primary[800],
    '--color-primary-900': colors.primary[900],
    '--color-primary-950': colors.primary[950],

    // Secondary color scale
    '--color-secondary-50': colors.secondary[50],
    '--color-secondary-100': colors.secondary[100],
    '--color-secondary-200': colors.secondary[200],
    '--color-secondary-300': colors.secondary[300],
    '--color-secondary-400': colors.secondary[400],
    '--color-secondary-500': colors.secondary[500],
    '--color-secondary-600': colors.secondary[600],
    '--color-secondary-700': colors.secondary[700],
    '--color-secondary-800': colors.secondary[800],
    '--color-secondary-900': colors.secondary[900],
    '--color-secondary-950': colors.secondary[950],

    // Accent color scale
    '--color-accent-50': colors.accent[50],
    '--color-accent-100': colors.accent[100],
    '--color-accent-200': colors.accent[200],
    '--color-accent-300': colors.accent[300],
    '--color-accent-400': colors.accent[400],
    '--color-accent-500': colors.accent[500],
    '--color-accent-600': colors.accent[600],
    '--color-accent-700': colors.accent[700],
    '--color-accent-800': colors.accent[800],
    '--color-accent-900': colors.accent[900],
    '--color-accent-950': colors.accent[950],
  }
}

// Helper functions for iTerm2 scheme parsing and generation
function parseITerm2Scheme(): AppTheme | null {
  // Simplified implementation - would need proper XML parsing in production
  try {
    // For now, return a basic theme based on common iTerm2 patterns
    return {
      id: `imported-${Date.now()}`,
      name: 'Imported iTerm2 Theme',
      type: 'light',
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        background: {
          primary: '#ffffff',
          secondary: '#f9fafb',
          tertiary: '#f3f4f6',
          elevated: '#ffffff',
        },
        text: {
          primary: '#111827',
          secondary: '#6b7280',
          muted: '#9ca3af',
          inverse: '#ffffff',
        },
        border: {
          light: '#e5e7eb',
          medium: '#d1d5db',
          dark: '#9ca3af',
        },
        interactive: {
          hover: '#f3f4f6',
          active: '#e5e7eb',
          focus: '#3b82f6',
          disabled: '#d1d5db',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
      },
    }
  } catch (error) {
    console.error('Error parsing iTerm2 scheme:', error)
    return null
  }
}

function generateITerm2Scheme(theme: AppTheme): string {
  // Generate iTerm2-compatible color scheme
  const { colors } = theme

  // This would generate an XML property list format
  // For now, return a simplified representation
  return `# ${theme.name} Color Scheme
  
  # This is a simplified representation
  # In production, this would generate proper iTerm2 .itermcolors format
  
  Foreground: ${colors.text.primary}
  Background: ${colors.background.primary}
  Cursor: ${colors.interactive.focus}
  Selection: ${colors.interactive.hover}
  
  Primary Colors:
    Black: ${colors.primary[700]}
    Red: ${colors.error[500]}
    Green: ${colors.success[500]}
    Yellow: ${colors.warning[500]}
    Blue: ${colors.primary[500]}
    Magenta: ${colors.secondary[500]}
    Cyan: ${colors.accent[500]}
    White: ${colors.text.secondary}
  
  Bright Colors:
    Bright Black: ${colors.border.dark}
    Bright Red: ${colors.error[400]}
    Bright Green: ${colors.success[400]}
    Bright Yellow: ${colors.warning[400]}
    Bright Blue: ${colors.primary[400]}
    Bright Magenta: ${colors.secondary[400]}
    Bright Cyan: ${colors.accent[400]}
    Bright White: ${colors.text.primary}
  `
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => {
      // Initialize theme
      const storedThemeId = getStoredThemeId()
      const storedTheme = storedThemeId ? getThemeById(storedThemeId) : null
      const initialTheme = storedTheme || getAutoTheme()

      // Apply initial theme
      if (typeof window !== 'undefined') {
        applyThemeToDOM(initialTheme)
      }

      return {
        currentTheme: initialTheme,
        customThemes: [],
        hasManualOverride: storedThemeId !== null,

        setTheme: (themeId: string) => {
          const theme = getThemeById(themeId) || getAutoTheme()

          set({
            currentTheme: theme,
            hasManualOverride: true,
          })

          if (typeof window !== 'undefined') {
            window.localStorage.setItem('markboard-theme-id', themeId)
            applyThemeToDOM(theme)
          }
        },

        setAutoTheme: () => {
          const autoTheme = getAutoTheme()

          set({
            currentTheme: autoTheme,
            hasManualOverride: false,
          })

          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('markboard-theme-id')
            applyThemeToDOM(autoTheme)
          }
        },

        addCustomTheme: (theme: AppTheme) => {
          set(state => ({
            customThemes: [...state.customThemes, theme],
          }))
        },

        removeCustomTheme: (themeId: string) => {
          set(state => ({
            customThemes: state.customThemes.filter(t => t.id !== themeId),
          }))
        },

        toggleTheme: () => {
          const { currentTheme } = get()
          const availableThemes = [...allThemes, ...get().customThemes]

          // Find next theme in the same type group
          const currentIndex = availableThemes.findIndex(
            t => t.id === currentTheme.id
          )
          const nextIndex = (currentIndex + 1) % availableThemes.length
          const nextTheme = availableThemes[nextIndex]

          get().setTheme(nextTheme.id)
        },

        importITerm2Scheme: (_schemeText: string) => {
          try {
            // This is a simplified parser - in production you'd use a proper XML parser
            const theme = parseITerm2Scheme()
            if (theme) {
              get().addCustomTheme(theme)
              get().setTheme(theme.id)
            }
          } catch (error) {
            console.error('Failed to import iTerm2 color scheme:', error)
          }
        },

        exportCurrentTheme: () => {
          const { currentTheme } = get()
          return generateITerm2Scheme(currentTheme)
        },
      }
    },
    {
      name: 'markboard-theme-storage',
      partialize: (state: ThemeState) => ({
        currentTheme: state.currentTheme,
        customThemes: state.customThemes,
        hasManualOverride: state.hasManualOverride,
      }),
    }
  )
)
