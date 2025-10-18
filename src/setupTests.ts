import '@testing-library/jest-dom'
import { JSDOM } from 'jsdom'

console.log('setupTests.ts is running')

// Set up JSDOM for React Testing Library
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
})

;(globalThis as any).window = dom.window
;(globalThis as any).document = dom.window.document
;(globalThis as any).navigator = dom.window.navigator
;(globalThis as any).HTMLElement = dom.window.HTMLElement
;(globalThis as any).HTMLInputElement = dom.window.HTMLInputElement
;(globalThis as any).HTMLButtonElement = dom.window.HTMLButtonElement
;(globalThis as any).Event = dom.window.Event
;(globalThis as any).MouseEvent = dom.window.MouseEvent
;(globalThis as any).KeyboardEvent = dom.window.KeyboardEvent

// Ensure document.body exists
if (!document.body) {
  document.body = document.createElement('body')
}

// Mock window.matchMedia for theme toggle tests
const matchMediaMock = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {}, // deprecated
  removeListener: () => {}, // deprecated
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
})

// Mock localStorage
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock document methods
const classListMock = {
  add: () => {},
  remove: () => {},
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
document.addEventListener = () => {}
document.removeEventListener = () => {}

// Mock document.querySelector
document.querySelector = () => null

// Mock document.body for React Testing Library
Object.defineProperty(document, 'body', {
  value: {
    appendChild: () => ({}),
  },
  writable: true,
})

// Mock document.createElement
document.createElement = () => ({}) as any

// Mock window.alert for CardEditor tests
window.alert = () => {}

// Mock @dnd-kit modules globally for component tests
;(globalThis as any).jest = {
  mock: () => {}, // No-op for now
  fn: () => () => {},
  clearAllMocks: () => {},
  spyOn: () => ({
    mockResolvedValue: () => {},
    mockRejectedValue: () => {},
    mockImplementation: () => {},
  }),
}

// Mock @dnd-kit/sortable
const mockUseSortable = () => ({
  attributes: {},
  listeners: {},
  setNodeRef: () => {},
  transform: null,
  transition: null,
  isDragging: false,
})

const mockCSS = {
  Transform: {
    toString: () => '',
  },
}

// Try to mock the modules by setting them on global
;(globalThis as any)['@dnd-kit/sortable'] = { useSortable: mockUseSortable }
;(globalThis as any)['@dnd-kit/utilities'] = { CSS: mockCSS }

// Initial setup complete - individual test files will handle mock resets
