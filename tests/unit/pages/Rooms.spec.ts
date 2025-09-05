import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouterMock, injectRouterMock } from 'vue-router-mock'
import Rooms from '@/pages/Rooms.vue'
import { roomService, dormitoryService, roomTypeService } from '@/services/api'

// Mock the API services
vi.mock('@/services/api', () => ({
  roomService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  dormitoryService: {
    getAll: vi.fn()
  },
  roomTypeService: {
    getAll: vi.fn()
  }
}))

// Mock the composables
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
    showConfirmation: vi.fn().mockResolvedValue(true)
  })
}))

// Mock i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

describe('Rooms.vue', () => {
  let wrapper: any
  let router: any

  // Helper function to create mock axios response
  const createMockAxiosResponse = (data: any) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers: {}
    }
  } as any)

  const mockRooms = [
    {
      id: 1,
      room_number: '101',
      room_type_id: 1,
      dormitory_id: 1,
      capacity: 4,
      current_occupancy: 2,
      status: 'available',
      price_per_month: 500.00,
      description: 'Standard room with shared bathroom',
      room_type: {
        id: 1,
        name: 'Standard',
        description: 'Standard dormitory room'
      },
      dormitory: {
        id: 1,
        name: 'Main Dormitory',
        address: '123 Campus Drive'
      }
    },
    {
      id: 2,
      room_number: '201',
      room_type_id: 2,
      dormitory_id: 1,
      capacity: 2,
      current_occupancy: 1,
      status: 'occupied',
      price_per_month: 600.00,
      description: 'Premium room with private bathroom',
      room_type: {
        id: 2,
        name: 'Premium',
        description: 'Premium dormitory room'
      },
      dormitory: {
        id: 1,
        name: 'Main Dormitory',
        address: '123 Campus Drive'
      }
    }
  ]

  beforeEach(() => {
    router = createRouterMock()
    injectRouterMock(router)
    
    // Reset all mocks
    vi.clearAllMocks()
    
    // Set up default mocks
    vi.mocked(roomService.getAll).mockResolvedValue(createMockAxiosResponse([]))
    vi.mocked(dormitoryService.getAll).mockResolvedValue(createMockAxiosResponse([]))
    vi.mocked(roomTypeService.getAll).mockResolvedValue(createMockAxiosResponse([]))
    
    wrapper = mount(Rooms, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ],
        stubs: {
          CButton: {
            template: '<button><slot /></button>'
          },
          CSelect: {
            template: '<select><slot /></select>'
          },
          CTable: {
            template: '<table><slot /></table>'
          },
          CTableHead: {
            template: '<thead><slot /></thead>'
          },
          CTableBody: {
            template: '<tbody><slot /></tbody>'
          },
          CTableRow: {
            template: '<tr><slot /></tr>'
          },
          CTableCell: {
            template: '<td><slot /></td>'
          },
          CTableHeadCell: {
            template: '<th><slot /></th>'
          },
          PlusIcon: {
            template: '<div>+</div>'
          },
          PencilSquareIcon: {
            template: '<div>edit</div>'
          },
          TrashIcon: {
            template: '<div>delete</div>'
          }
        }
      }
    })
  })

  it('renders rooms page correctly', () => {
    expect(wrapper.find('h1').text()).toBe('Rooms')
    expect(wrapper.text()).toContain('Add Room')
  })

  it('loads rooms on mount', async () => {
    const mockGetAll = vi.mocked(roomService.getAll)
    const mockDormitoriesGetAll = vi.mocked(dormitoryService.getAll)
    const mockRoomTypesGetAll = vi.mocked(roomTypeService.getAll)
    
    // Mock localStorage to simulate authentication
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue('mock-token')
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
    
    // Mock Laravel paginated response structure
    mockGetAll.mockResolvedValue(createMockAxiosResponse({
      data: mockRooms,
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: mockRooms.length
    }))
    mockDormitoriesGetAll.mockResolvedValue(createMockAxiosResponse({
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0
    }))
    mockRoomTypesGetAll.mockResolvedValue(createMockAxiosResponse({
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0
    }))

    await wrapper.vm.loadRooms()

    expect(mockGetAll).toHaveBeenCalled()
    expect(wrapper.vm.rooms).toEqual(mockRooms)
  })

  it('handles loading state', async () => {
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.loading-text').exists()).toBe(true)
  })

  it('handles error state', async () => {
    wrapper.vm.error = 'Failed to load rooms'
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-message').text()).toBe('Failed to load rooms')
  })

  it('filters rooms by search term', async () => {
    const mockGetAll = vi.mocked(roomService.getAll)
    mockGetAll.mockResolvedValue(createMockAxiosResponse({ data: [mockRooms[0]] }))
    
    wrapper.vm.searchTerm = '101'
    await wrapper.vm.$nextTick()
    
    // Wait for the watcher to trigger loadRooms
    await wrapper.vm.$nextTick()
    
    expect(mockGetAll).toHaveBeenCalledWith({ number: '101' })
  })

  it('filters rooms by status', async () => {
    const mockGetAll = vi.mocked(roomService.getAll)
    mockGetAll.mockResolvedValue(createMockAxiosResponse({ data: [mockRooms[0]] }))
    
    wrapper.vm.statusFilter = 'available'
    await wrapper.vm.$nextTick()
    
    // Wait for the watcher to trigger loadRooms
    await wrapper.vm.$nextTick()
    
    expect(mockGetAll).toHaveBeenCalledWith({ status: 'available' })
  })

  it('filters rooms by dormitory', async () => {
    const mockGetAll = vi.mocked(roomService.getAll)
    mockGetAll.mockResolvedValue(createMockAxiosResponse({ data: mockRooms }))
    
    wrapper.vm.dormitoryFilter = 1
    await wrapper.vm.$nextTick()
    
    // Wait for the watcher to trigger loadRooms
    await wrapper.vm.$nextTick()
    
    expect(mockGetAll).toHaveBeenCalledWith({ dormitory_id: 1 })
  })

  it('creates new room', async () => {
    const mockCreate = vi.mocked(roomService.create)
    const newRoomData = {
      room_number: '301',
      room_type_id: 1,
      dormitory_id: 1,
      capacity: 4,
      price_per_month: 450.00,
      description: 'New standard room'
    }
    mockCreate.mockResolvedValue(createMockAxiosResponse({ id: 3, ...newRoomData }))

    await wrapper.vm.createRoom(newRoomData)

    expect(mockCreate).toHaveBeenCalledWith(newRoomData)
  })

  it('updates existing room', async () => {
    const mockUpdate = vi.mocked(roomService.update)
    mockUpdate.mockResolvedValue(createMockAxiosResponse({ ...mockRooms[0], price_per_month: 550.00 }))

    const updatedRoom = { ...mockRooms[0], price_per_month: 550.00 }

    await wrapper.vm.updateRoom(1, updatedRoom)

    expect(mockUpdate).toHaveBeenCalledWith(1, updatedRoom)
  })

  it('deletes room', async () => {
    const mockDelete = vi.mocked(roomService.delete)
    mockDelete.mockResolvedValue(createMockAxiosResponse({ message: 'Room deleted' }))

    await wrapper.vm.deleteRoom(1)

    expect(mockDelete).toHaveBeenCalledWith(1)
  })

  it('handles API errors gracefully', async () => {
    const mockGetAll = vi.mocked(roomService.getAll)
    mockGetAll.mockRejectedValue(new Error('API Error'))

    // Mock localStorage to simulate no token
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null)
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    await wrapper.vm.loadRooms()

    expect(wrapper.vm.error).toBe('Authentication required')
    expect(wrapper.vm.loading).toBe(false)
  })

  it('paginates rooms correctly', async () => {
    const manyRooms = Array.from({ length: 25 }, (_, i) => ({
      ...mockRooms[0],
      id: i + 1,
      room_number: `${100 + i + 1}`
    }))

    wrapper.vm.rooms = manyRooms
    wrapper.vm.itemsPerPage = 10
    wrapper.vm.currentPage = 1
    await wrapper.vm.$nextTick()

    const paginatedRooms = wrapper.vm.paginatedRooms
    expect(paginatedRooms).toHaveLength(10)
    expect(paginatedRooms[0].id).toBe(1)
  })

  it('calculates occupancy statistics', async () => {
    wrapper.vm.rooms = mockRooms
    await wrapper.vm.$nextTick()

    const stats = wrapper.vm.occupancyStats
    expect(stats.totalRooms).toBe(2)
    expect(stats.availableRooms).toBe(1)
    expect(stats.occupiedRooms).toBe(1)
    expect(stats.occupancyRate).toBe(50)
  })

  it('shows room form modal', async () => {
    await wrapper.vm.showRoomForm()
    expect(wrapper.vm.showForm).toBe(true)
  })

  it('closes room form modal', async () => {
    wrapper.vm.showForm = true
    await wrapper.vm.closeRoomForm()
    expect(wrapper.vm.showForm).toBe(false)
  })

  it('handles form submission', async () => {
    const mockCreate = vi.mocked(roomService.create)
    const formData = {
      room_number: '301',
      room_type_id: 1,
      dormitory_id: 1,
      capacity: 4,
      price_per_month: 450.00,
      description: 'New standard room'
    }
    mockCreate.mockResolvedValue(createMockAxiosResponse({ id: 3, ...formData }))

    await wrapper.vm.handleFormSubmit(formData)

    expect(mockCreate).toHaveBeenCalledWith(formData)
    expect(wrapper.vm.showForm).toBe(false)
  })

  it('calculates available capacity', () => {
    expect(wrapper.vm.getAvailableCapacity(mockRooms[0])).toBe(2)
    expect(wrapper.vm.getAvailableCapacity(mockRooms[1])).toBe(1)
  })

  it('determines room status color', () => {
    expect(wrapper.vm.getStatusColor('available')).toBe('green')
    expect(wrapper.vm.getStatusColor('occupied')).toBe('yellow')
    expect(wrapper.vm.getStatusColor('maintenance')).toBe('red')
  })

  it('formats price correctly', () => {
    expect(wrapper.vm.formatPrice(500.00)).toBe('$500.00')
    expect(wrapper.vm.formatPrice(1200.50)).toBe('$1,200.50')
  })
})
