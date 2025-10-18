import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

console.log('setupTests.ts is running')

// Ensure window and document exist (jsdom should provide them)
if (typeof window === 'undefined') {
  console.warn('window is undefined - jsdom environment not set up properly')
}

if (typeof document === 'undefined') {
  console.warn('document is undefined - jsdom environment not set up properly')
}

// Mock window.matchMedia for theme toggle tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock document methods
const classListMock = {
  add: vi.fn(),
  remove: vi.fn(),
}
Object.defineProperty(document, 'documentElement', {
  value: {
    classList: classListMock,
  },
  writable: true,
})

// Mock document.hidden
Object.defineProperty(document, 'hidden', {
  value: false,
  writable: true,
})

// Mock document event listeners
document.addEventListener = vi.fn()
document.removeEventListener = vi.fn()

// Mock document.querySelector
document.querySelector = vi.fn()

// Mock document.body for React Testing Library
Object.defineProperty(document, 'body', {
  value: {
    appendChild: vi.fn(() => ({})),
  },
  writable: true,
})

// Mock document.createElement
document.createElement = vi.fn(() => ({}) as any)

// Mock window.alert for CardEditor tests
window.alert = vi.fn()

// Mock additional browser APIs that React needs
Object.defineProperty(window, 'WebkitAnimation', {
  value: '',
  writable: true,
})

Object.defineProperty(window, 'MozAnimation', {
  value: '',
  writable: true,
})

Object.defineProperty(window, 'OAnimation', {
  value: '',
  writable: true,
})

Object.defineProperty(window, 'msAnimation', {
  value: '',
  writable: true,
})

// Mock HTMLElement.prototype properties
Object.defineProperty(HTMLElement.prototype, 'animate', {
  value: vi.fn(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    finish: vi.fn(),
  })),
  writable: true,
})

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  classListMock.add.mockClear()
  classListMock.remove.mockClear()
  ;(global.document.addEventListener as any).mockClear()
  ;(global.document.removeEventListener as any).mockClear()
  ;(global.document.querySelector as any).mockClear()
  ;(global.document.body.appendChild as any).mockClear()
  ;(global.document.createElement as any).mockClear()
  ;(global.window.matchMedia as any).mockClear()
  ;(global.window.alert as any).mockClear()
})
