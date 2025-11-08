import { useThemeStore } from '../stores/themeStore'

export function useTheme() {
  const currentTheme = useThemeStore(state => state.currentTheme)
  const customThemes = useThemeStore(state => state.customThemes)
  const hasManualOverride = useThemeStore(state => state.hasManualOverride)
  const setTheme = useThemeStore(state => state.setTheme)
  const setAutoTheme = useThemeStore(state => state.setAutoTheme)
  const toggleTheme = useThemeStore(state => state.toggleTheme)
  const importITerm2Scheme = useThemeStore(state => state.importITerm2Scheme)
  const exportCurrentTheme = useThemeStore(state => state.exportCurrentTheme)
  const addCustomTheme = useThemeStore(state => state.addCustomTheme)
  const removeCustomTheme = useThemeStore(state => state.removeCustomTheme)

  return {
    currentTheme,
    customThemes,
    hasManualOverride,
    setTheme,
    setAutoTheme,
    toggleTheme,
    importITerm2Scheme,
    exportCurrentTheme,
    addCustomTheme,
    removeCustomTheme,
  }
}
