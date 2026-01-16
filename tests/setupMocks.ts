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

// Mock vue components
vi.mock('@/components/CButton.vue', () => ({
  default: {
    name: 'CButton',
    template: '<button><slot /></button>',
    props: ['variant', 'size', 'disabled', 'label'],
    emits: ['click']
  }
}));

vi.mock('@/components/BedPlacementEditor.vue', () => ({
  default: {
    name: 'BedPlacementEditor',
    template: '<div class="bed-placement-editor"><slot /></div>',
    props: ['minimapSrc', 'capacity', 'modelValue'],
    emits: ['update:modelValue']
  }
}));

vi.mock('@/components/BedLayoutViewer.vue', () => ({
  default: {
    name: 'BedLayoutViewer',
    template: '<div class="bed-layout-viewer"><slot /></div>',
    props: ['minimapSrc', 'beds', 'bedStatuses']
  }
}));

// Mock pages
vi.mock('@/pages/RoomTypeForm.vue', () => ({
  default: {
    name: 'RoomTypeForm',
    template: '<div class="room-type-basic-form"><slot /></div>',
    props: [],
    data: () => ({
      form: {
        name: '',
        description: '',
        minimap: '',
        capacity: 1,
        daily_rate: 0,
        semester_rate: 0,
        beds: []
      }
    })
  }
}));

// Mock stores
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { role: { name: 'admin' } },
    login: vi.fn(),
    logout: vi.fn()
  })
}));

vi.mock('@/stores/settings', () => ({
  useSettingsStore: () => ({
    generalSettings: { currency_symbol: '$' },
    publicSettings: {},
    fetchAllSettings: vi.fn()
  })
}));

// Mock services
vi.mock('@/services/api', () => ({
  roomTypeService: {
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    list: vi.fn()
  },
  configurationService: {
    getGeneralSettings: vi.fn()
  },
  resolvedBaseUrl: 'http://localhost:8000/api'
}));
