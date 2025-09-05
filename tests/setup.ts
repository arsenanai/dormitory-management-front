// URL polyfill now loaded from tests/urlPolyfill.js
import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createTestingPinia } from '@pinia/testing'

// Setup i18n for tests
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.create': 'Create',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.sort': 'Sort',
      'common.actions': 'Actions',
      'common.confirm': 'Confirm',
      'common.yes': 'Yes',
      'common.no': 'No',
      'Failed to mark message as read': 'Failed to mark message as read',
    }
  }
})

// Setup global test configuration
config.global.plugins = [i18n, createTestingPinia({ createSpy: vi.fn })]

// Mock router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: {
    value: {
      path: '/',
      params: {},
      query: {},
      name: 'home'
    }
  }
}

config.global.mocks = {
  $router: mockRouter,
  $route: mockRouter.currentRoute.value
}

// Mock global objects
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-object-url'),
    revokeObjectURL: vi.fn(),
  },
  writable: true
})

Object.defineProperty(global, 'Blob', {
  value: vi.fn(),
  writable: true
})

// Mock fetch
Object.defineProperty(global, 'fetch', {
  value: vi.fn(),
  writable: true
})

// Mock console methods to avoid spam in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock ResizeObserver
Object.defineProperty(global, 'ResizeObserver', {
  value: vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  writable: true
})

// Mock IntersectionObserver
Object.defineProperty(global, 'IntersectionObserver', {
  value: vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
    takeRecords: vi.fn(() => [])
  })),
  writable: true
})

// Mock matchMedia
Object.defineProperty(global, 'matchMedia', {
  value: vi.fn(() => ({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    media: '',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  })),
  writable: true
})

// Mock confirm dialog
Object.defineProperty(global, 'confirm', {
  value: vi.fn(() => true),
  writable: true
})

// Configure Vue Test Utils
config.global.mocks = {
  $t: (key: string) => key,
  $route: {
    params: {},
    query: {},
    path: '/',
    name: 'home',
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  },
}
