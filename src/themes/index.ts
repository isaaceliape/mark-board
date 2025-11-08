export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface ThemeColors {
  primary: ColorScale
  secondary: ColorScale
  accent: ColorScale
  success: ColorScale
  warning: ColorScale
  error: ColorScale
  info: ColorScale

  // Background colors
  background: {
    primary: string
    secondary: string
    tertiary: string
    elevated: string
  }

  // Text colors
  text: {
    primary: string
    secondary: string
    muted: string
    inverse: string
  }

  // Border colors
  border: {
    light: string
    medium: string
    dark: string
  }

  // Interactive elements
  interactive: {
    hover: string
    active: string
    focus: string
    disabled: string
  }

  // Status indicators
  status: {
    success: string
    warning: string
    error: string
    info: string
  }
}

export interface ITerm2ColorScheme {
  name: string
  author?: string
  description?: string

  // iTerm2 color mapping
  colors: {
    // Foreground and background
    foreground: string
    background: string
    backgroundBold: string

    // Selection colors
    selection: string
    selectionText: string

    // Cursor
    cursor: string
    cursorText: string

    // Basic colors (0-7)
    black: string
    red: string
    green: string
    yellow: string
    blue: string
    magenta: string
    cyan: string
    white: string

    // Bright colors (8-15)
    brightBlack: string
    brightRed: string
    brightGreen: string
    brightYellow: string
    brightBlue: string
    brightMagenta: string
    brightCyan: string
    brightWhite: string
  }
}

export interface AppTheme {
  id: string
  name: string
  type: 'light' | 'dark' | 'auto'
  colors: ThemeColors
  iTerm2Scheme?: ITerm2ColorScheme
}

// Helper function to generate color scale from base color
function generateColorScale(baseColor: string): ColorScale {
  // This is a simplified version - in a real implementation,
  // you'd use a proper color manipulation library
  return {
    50: baseColor,
    100: baseColor,
    200: baseColor,
    300: baseColor,
    400: baseColor,
    500: baseColor,
    600: baseColor,
    700: baseColor,
    800: baseColor,
    900: baseColor,
    950: baseColor,
  }
}

// Map iTerm2 colors to app colors
function mapITerm2ToAppColors(
  iterm2: ITerm2ColorScheme,
  isDark: boolean
): ThemeColors {
  const bg = isDark ? iterm2.colors.background : '#ffffff'
  const fg = isDark ? iterm2.colors.foreground : '#000000'

  return {
    primary: generateColorScale(iterm2.colors.blue),
    secondary: generateColorScale(iterm2.colors.magenta),
    accent: generateColorScale(iterm2.colors.cyan),
    success: generateColorScale(iterm2.colors.green),
    warning: generateColorScale(iterm2.colors.yellow),
    error: generateColorScale(iterm2.colors.red),
    info: generateColorScale(iterm2.colors.blue),

    background: {
      primary: bg,
      secondary: isDark ? '#1f2937' : '#f9fafb',
      tertiary: isDark ? '#374151' : '#f3f4f6',
      elevated: isDark ? '#4b5563' : '#ffffff',
    },

    text: {
      primary: fg,
      secondary: isDark ? '#d1d5db' : '#6b7280',
      muted: isDark ? '#9ca3af' : '#9ca3af',
      inverse: isDark ? '#ffffff' : '#000000',
    },

    border: {
      light: isDark ? '#374151' : '#e5e7eb',
      medium: isDark ? '#4b5563' : '#d1d5db',
      dark: isDark ? '#6b7283' : '#9ca3af',
    },

    interactive: {
      hover: isDark ? '#374151' : '#f3f4f6',
      active: isDark ? '#4b5563' : '#e5e7eb',
      focus: iterm2.colors.blue,
      disabled: isDark ? '#6b7283' : '#d1d5db',
    },

    status: {
      success: iterm2.colors.green,
      warning: iterm2.colors.yellow,
      error: iterm2.colors.red,
      info: iterm2.colors.blue,
    },
  }
}

// Pre-defined iTerm2 color schemes mapped to app themes
export const iTerm2Schemes: ITerm2ColorScheme[] = [
  {
    name: 'Solarized Dark',
    description: 'A carefully designed low-contrast color scheme',
    colors: {
      foreground: '#93a1a1',
      background: '#002b36',
      backgroundBold: '#073642',
      selection: '#073642',
      selectionText: '#93a1a1',
      cursor: '#93a1a1',
      cursorText: '#002b36',
      black: '#073642',
      red: '#dc322f',
      green: '#859900',
      yellow: '#b58900',
      blue: '#268bd2',
      magenta: '#d33682',
      cyan: '#2aa198',
      white: '#eee8d5',
      brightBlack: '#002b36',
      brightRed: '#cb4b16',
      brightGreen: '#586e75',
      brightYellow: '#657b83',
      brightBlue: '#839496',
      brightMagenta: '#6c71c4',
      brightCyan: '#93a1a1',
      brightWhite: '#fdf6e3',
    },
  },
  {
    name: 'Solarized Light',
    description: 'A carefully designed low-contrast color scheme',
    colors: {
      foreground: '#657b83',
      background: '#fdf6e3',
      backgroundBold: '#fdf6e3',
      selection: '#eee8d5',
      selectionText: '#657b83',
      cursor: '#657b83',
      cursorText: '#fdf6e3',
      black: '#073642',
      red: '#dc322f',
      green: '#859900',
      yellow: '#b58900',
      blue: '#268bd2',
      magenta: '#d33682',
      cyan: '#2aa198',
      white: '#eee8d5',
      brightBlack: '#002b36',
      brightRed: '#cb4b16',
      brightGreen: '#586e75',
      brightYellow: '#657b83',
      brightBlue: '#839496',
      brightMagenta: '#6c71c4',
      brightCyan: '#93a1a1',
      brightWhite: '#fdf6e3',
    },
  },
  {
    name: 'Dracula',
    description:
      'A dark theme for many editors, terminals, and other applications',
    colors: {
      foreground: '#f8f8f2',
      background: '#282a36',
      backgroundBold: '#44475a',
      selection: '#44475a',
      selectionText: '#f8f8f2',
      cursor: '#f8f8f2',
      cursorText: '#282a36',
      black: '#21222c',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#8be9fd',
      magenta: '#ff79c6',
      cyan: '#8be9fd',
      white: '#f8f8f2',
      brightBlack: '#6272a4',
      brightRed: '#ff6e6e',
      brightGreen: '#69ff94',
      brightYellow: '#ffffb5',
      brightBlue: '#82aaff',
      brightMagenta: '#ff92df',
      brightCyan: '#a4ffff',
      brightWhite: '#ffffff',
    },
  },
  {
    name: 'One Dark',
    description: 'Atom One Dark theme',
    colors: {
      foreground: '#abb2bf',
      background: '#282c34',
      backgroundBold: '#21252b',
      selection: '#3b4048',
      selectionText: '#abb2bf',
      cursor: '#abb2bf',
      cursorText: '#282c34',
      black: '#282c34',
      red: '#e06c75',
      green: '#98c379',
      yellow: '#d19a66',
      blue: '#61afef',
      magenta: '#c678dd',
      cyan: '#56b6c2',
      white: '#abb2bf',
      brightBlack: '#5c6370',
      brightRed: '#e06c75',
      brightGreen: '#98c379',
      brightYellow: '#d19a66',
      brightBlue: '#61afef',
      brightMagenta: '#c678dd',
      brightCyan: '#56b6c2',
      brightWhite: '#ffffff',
    },
  },
  {
    name: 'Monokai',
    description: 'Monokai color scheme',
    colors: {
      foreground: '#f8f8f2',
      background: '#272822',
      backgroundBold: '#3e3d32',
      selection: '#49483e',
      selectionText: '#f8f8f2',
      cursor: '#f8f8f2',
      cursorText: '#272822',
      black: '#272822',
      red: '#f92672',
      green: '#a6e22e',
      yellow: '#f4e98b',
      blue: '#66d9ef',
      magenta: '#ae81ff',
      cyan: '#66d9ef',
      white: '#f8f8f2',
      brightBlack: '#75715e',
      brightRed: '#f92672',
      brightGreen: '#a6e22e',
      brightYellow: '#f4e98b',
      brightBlue: '#66d9ef',
      brightMagenta: '#ae81ff',
      brightCyan: '#66d9ef',
      brightWhite: '#f9f8f5',
    },
  },
]

// Convert iTerm2 schemes to app themes
export const appThemes: AppTheme[] = iTerm2Schemes.flatMap(scheme => [
  {
    id: `${scheme.name.toLowerCase().replace(/\s+/g, '-')}-dark`,
    name: `${scheme.name} Dark`,
    type: 'dark',
    colors: mapITerm2ToAppColors(scheme, true),
    iTerm2Scheme: scheme,
  },
  {
    id: `${scheme.name.toLowerCase().replace(/\s+/g, '-')}-light`,
    name: `${scheme.name} Light`,
    type: 'light',
    colors: mapITerm2ToAppColors(scheme, false),
    iTerm2Scheme: scheme,
  },
])

// Add default themes
export const defaultThemes: AppTheme[] = [
  {
    id: 'light-default',
    name: 'Light Default',
    type: 'light',
    colors: {
      primary: generateColorScale('#3b82f6'),
      secondary: generateColorScale('#8b5cf6'),
      accent: generateColorScale('#06b6d4'),
      success: generateColorScale('#10b981'),
      warning: generateColorScale('#f59e0b'),
      error: generateColorScale('#ef4444'),
      info: generateColorScale('#3b82f6'),
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
  },
  {
    id: 'dark-default',
    name: 'Dark Default',
    type: 'dark',
    colors: {
      primary: generateColorScale('#3b82f6'),
      secondary: generateColorScale('#8b5cf6'),
      accent: generateColorScale('#06b6d4'),
      success: generateColorScale('#10b981'),
      warning: generateColorScale('#f59e0b'),
      error: generateColorScale('#ef4444'),
      info: generateColorScale('#3b82f6'),
      background: {
        primary: '#111827',
        secondary: '#1f2937',
        tertiary: '#374151',
        elevated: '#4b5563',
      },
      text: {
        primary: '#f9fafb',
        secondary: '#d1d5db',
        muted: '#9ca3af',
        inverse: '#111827',
      },
      border: {
        light: '#374151',
        medium: '#4b5563',
        dark: '#6b7283',
      },
      interactive: {
        hover: '#374151',
        active: '#4b5563',
        focus: '#3b82f6',
        disabled: '#6b7283',
      },
      status: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
    },
  },
]

// Combine all themes
export const allThemes: AppTheme[] = [...defaultThemes, ...appThemes]

// Find theme by ID
export function getThemeById(id: string): AppTheme | undefined {
  return allThemes.find(theme => theme.id === id)
}

// Get themes by type
export function getThemesByType(type: 'light' | 'dark' | 'auto'): AppTheme[] {
  return allThemes.filter(theme => theme.type === type || theme.type === 'auto')
}

// Auto theme based on system preference
export function getAutoTheme(): AppTheme {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches

  return prefersDark
    ? getThemeById('dark-default')!
    : getThemeById('light-default')!
}
