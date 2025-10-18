import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeToggle } from '../ThemeToggle'
import { vi } from 'vitest'

describe('ThemeToggle', () => {
  it('renders without crashing', () => {
    ;(window.matchMedia as any).mockReturnValue({
      matches: false, // light mode
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('initializes with system preference when no stored theme', () => {
    ;(window.matchMedia as any).mockReturnValue({
      matches: true, // dark mode
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
    render(<ThemeToggle />)

    // Should apply dark class since system prefers dark and no stored preference
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
  })

  it('initializes with stored theme over system preference', () => {
    ;(window.localStorage.getItem as any).mockReturnValue('light')
    ;(window.matchMedia as any).mockReturnValue({
      matches: true, // system prefers dark
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
    render(<ThemeToggle />)

    // Should apply light class since stored preference takes precedence
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
      'dark'
    )
  })

  it('toggles theme and persists to localStorage', () => {
    ;(window.matchMedia as any).mockReturnValue({
      matches: false, // light mode
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Should set dark theme in localStorage
    expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
  })

  it('shows correct icon and label for light theme', () => {
    ;(window.matchMedia as any).mockReturnValue({
      matches: false, // light mode
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
    ;(document.querySelector as any).mockReturnValue(
      document.createElement('svg')
    )
    render(<ThemeToggle />)

    // Should show moon icon for light theme (to switch to dark)
    expect(document.querySelector).toHaveBeenCalledWith('svg')
    expect(screen.getByText('Light')).toBeInTheDocument()
  })

  it('shows correct icon and label for dark theme', () => {
    ;(window.matchMedia as any).mockReturnValue({
      matches: true, // dark mode
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
    ;(document.querySelector as any).mockReturnValue(
      document.createElement('svg')
    )
    render(<ThemeToggle />)

    // Should show sun icon for dark theme (to switch to light)
    expect(document.querySelector).toHaveBeenCalledWith('svg')
    expect(screen.getByText('Dark')).toBeInTheDocument()
  })

  it('responds to system preference changes when no manual override', async () => {
    const mockMediaQuery = {
      matches: false, // start with light
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }
    ;(window.matchMedia as any).mockReturnValue(mockMediaQuery)

    render(<ThemeToggle />)

    // Simulate system preference change to dark
    const changeEvent = new MediaQueryListEvent('change', { matches: true })

    // Trigger the change event
    const addEventListener = mockMediaQuery.addEventListener as any
    const changeHandler = addEventListener.mock.calls[0][1]
    changeHandler(changeEvent)

    await waitFor(() => {
      expect(document.documentElement.classList.add).toHaveBeenCalledWith(
        'dark'
      )
    })
  })

  it('ignores system preference changes after manual override', async () => {
    const mockMediaQuery = {
      matches: false, // start with light
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }
    ;(window.matchMedia as any).mockReturnValue(mockMediaQuery)

    render(<ThemeToggle />)

    // User manually toggles to dark
    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Simulate system preference change to light
    const changeEvent = new MediaQueryListEvent('change', { matches: false })

    const addEventListener = mockMediaQuery.addEventListener as any
    const changeHandler = addEventListener.mock.calls[0][1]
    changeHandler(changeEvent)

    // Should not change theme back to light since user manually overrode
    expect(document.documentElement.classList.remove).not.toHaveBeenCalledWith(
      'dark'
    )
  })
})
