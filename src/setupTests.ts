import '@testing-library/jest-dom'

console.log('setupTests.ts is running')

// Ensure window and document exist (Bun's test environment should provide them)
if (typeof window === 'undefined') {
  console.warn('window is undefined - test environment not set up properly')
}

if (typeof document === 'undefined') {
  console.warn('document is undefined - test environment not set up properly')
}

// Mock window.matchMedia for theme toggle tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock document methods
const classListMock = {
  add: jest.fn(),
  remove: jest.fn(),
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
document.addEventListener = jest.fn()
document.removeEventListener = jest.fn()

// Mock document.querySelector
document.querySelector = jest.fn()

// Mock document.body for React Testing Library
Object.defineProperty(document, 'body', {
  value: {
    appendChild: jest.fn(() => ({})),
  },
  writable: true,
})

// Mock document.createElement
document.createElement = jest.fn(() => ({}) as any)

// Mock window.alert for CardEditor tests
window.alert = jest.fn()

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
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
