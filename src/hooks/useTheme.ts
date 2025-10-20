import { useThemeStore } from '../stores/themeStore'

export function useTheme() {
  const theme = useThemeStore(state => state.theme)
  const toggle = useThemeStore(state => state.toggle)

  return { theme, toggle }
}
