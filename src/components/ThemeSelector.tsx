import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { allThemes, AppTheme } from '../themes'

export function ThemeSelector() {
  const {
    currentTheme,
    setTheme,
    setAutoTheme,
    setLightTheme,
    setDarkTheme,
    selectedLightThemeId,
    selectedDarkThemeId,
    customThemes,
    exportCurrentTheme,
  } = useTheme()
  const [showPreview, setShowPreview] = useState(false)

  const handleThemeSelect = (themeId: string) => {
    if (themeId === 'auto') {
      setAutoTheme()
    } else {
      setTheme(themeId)
    }
    setShowPreview(false)
  }

  const handleExportTheme = () => {
    const exportedTheme = exportCurrentTheme()

    // Create and download the theme file
    const blob = new Blob([exportedTheme], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const ThemePreview = ({ theme }: { theme: AppTheme }) => (
    <div className="p-3 rounded border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: theme.colors.background.primary }}
          title={theme.colors.background.primary}
        />
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: theme.colors.background.secondary }}
          title={theme.colors.background.secondary}
        />
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: theme.colors.primary[500] }}
          title={theme.colors.primary[500]}
        />
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: theme.colors.secondary[500] }}
          title={theme.colors.secondary[500]}
        />
      </div>
      <div className="space-y-1">
        <div
          className="h-2 rounded"
          style={{ backgroundColor: theme.colors.background.primary }}
        />
        <div
          className="h-1 rounded w-3/4"
          style={{ backgroundColor: theme.colors.text.secondary }}
        />
        <div
          className="h-1 rounded w-1/2"
          style={{ backgroundColor: theme.colors.primary[500] }}
        />
      </div>
    </div>
  )

  return (
    <div className="relative">
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-interactive-hover rounded-md transition-colors"
      >
        🎨 Theme
        {showPreview ? '▲' : '▼'}
      </button>

      {showPreview && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-background-elevated border border-border-medium rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-primary">
                Theme Settings
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleExportTheme}
                  className="px-2 py-1 text-xs bg-interactive-hover text-text-secondary rounded hover:bg-interactive-active"
                  title="Export current theme"
                >
                  📤 Export
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-2 py-1 text-xs bg-interactive-hover text-text-secondary rounded hover:bg-interactive-active"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Current Theme Info */}
            <div className="mb-4 p-3 bg-background-tertiary rounded-lg">
              <div className="flex items-center gap-3">
                <ThemePreview theme={currentTheme} />
                <div>
                  <h4 className="text-sm font-medium text-text-primary">
                    {currentTheme.name}
                  </h4>
                  <p className="text-xs text-text-muted">
                    Currently active theme
                  </p>
                </div>
              </div>
            </div>

            {/* Auto Theme Option */}
            <div className="mb-4">
              <button
                onClick={() => handleThemeSelect('auto')}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  currentTheme.type === 'auto'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-border-medium hover:border-primary-400 dark:hover:border-primary-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" />
                    <div className="w-4 h-4 bg-gray-800 dark:bg-gray-200 rounded border border-gray-300 dark:border-gray-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-text-primary">
                      Auto (System)
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Follow system light/dark preference
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Light Theme Selection */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-text-primary mb-3">
                Light Theme
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {allThemes
                  .filter(theme => theme.type === 'light')
                  .map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setLightTheme(theme.id)}
                      className={`text-left p-2 rounded-lg border transition-all ${
                        selectedLightThemeId === theme.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-border-medium hover:border-primary-400 dark:hover:border-primary-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div
                              className="w-3 h-3 rounded"
                              style={{
                                backgroundColor:
                                  theme.colors.background.primary,
                              }}
                            />
                            <div
                              className="w-3 h-3 rounded"
                              style={{
                                backgroundColor: theme.colors.primary[500],
                              }}
                            />
                          </div>
                          <div>
                            <span className="text-sm text-text-primary">
                              {theme.name}
                            </span>
                            <span className="text-xs text-text-muted ml-2">
                              {theme.type}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-text-muted">
                          {theme.iTerm2Scheme ? '🎨' : '🎯'}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Dark Theme Selection */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-text-primary mb-3">
                Dark Theme
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {allThemes
                  .filter(theme => theme.type === 'dark')
                  .map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setDarkTheme(theme.id)}
                      className={`text-left p-2 rounded-lg border transition-all ${
                        selectedDarkThemeId === theme.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-border-medium hover:border-primary-400 dark:hover:border-primary-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div
                              className="w-3 h-3 rounded"
                              style={{
                                backgroundColor:
                                  theme.colors.background.primary,
                              }}
                            />
                            <div
                              className="w-3 h-3 rounded"
                              style={{
                                backgroundColor: theme.colors.primary[500],
                              }}
                            />
                          </div>
                          <div>
                            <span className="text-sm text-text-primary">
                              {theme.name}
                            </span>
                            <span className="text-xs text-text-muted ml-2">
                              {theme.type}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-text-muted">
                          {theme.iTerm2Scheme ? '🎨' : '🎯'}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Custom Light Themes */}
            {customThemes.filter(theme => theme.type === 'light').length >
              0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-text-primary mb-3">
                  Custom Light Themes
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {customThemes
                    .filter(theme => theme.type === 'light')
                    .map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => setLightTheme(theme.id)}
                        className={`text-left p-2 rounded-lg border transition-all ${
                          selectedLightThemeId === theme.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-border-medium hover:border-primary-400 dark:hover:border-primary-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ThemePreview theme={theme} />
                          <div>
                            <span className="text-sm text-text-primary">
                              {theme.name}
                            </span>
                            <p className="text-xs text-text-muted">
                              Custom light theme
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Custom Dark Themes */}
            {customThemes.filter(theme => theme.type === 'dark').length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-text-primary mb-3">
                  Custom Dark Themes
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {customThemes
                    .filter(theme => theme.type === 'dark')
                    .map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => setDarkTheme(theme.id)}
                        className={`text-left p-2 rounded-lg border transition-all ${
                          selectedDarkThemeId === theme.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-border-medium hover:border-primary-400 dark:hover:border-primary-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ThemePreview theme={theme} />
                          <div>
                            <span className="text-sm text-text-primary">
                              {theme.name}
                            </span>
                            <p className="text-xs text-text-muted">
                              Custom dark theme
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Theme Import Instructions */}
            <div className="mt-4 p-3 bg-background-tertiary rounded-lg">
              <h4 className="text-sm font-medium text-text-primary mb-2">
                📋 iTerm2 Color Scheme Support
              </h4>
              <p className="text-xs text-text-secondary">
                This theme system is compatible with{' '}
                <a
                  href="https://iterm2colorschemes.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  iTerm2 Color Schemes
                </a>
                . Future versions will support importing/exporting .itermcolors
                files.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showPreview && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
