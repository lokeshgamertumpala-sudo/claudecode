import { vi } from 'vitest'

// Mock localStorage for zustand persist tests
const store = new Map()
const localStorageMock = {
  getItem: vi.fn(key => (store.has(key) ? store.get(key) : null)),
  setItem: vi.fn((key, value) => store.set(key, String(value))),
  removeItem: vi.fn(key => store.delete(key)),
  clear: vi.fn(() => store.clear()),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })

// Mock matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

export { localStorageMock }