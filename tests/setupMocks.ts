// Mock axios before any imports to avoid URL constructor issues
import { vi } from 'vitest';

// Extend global types
declare global {
  var showError: ReturnType<typeof vi.fn>;
}

// Mock localStorage FIRST before any imports that might use it
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock showError function
global.showError = vi.fn()

// Mock axios at the module level
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }))
    }
  };
});
