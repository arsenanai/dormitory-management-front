import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouterMock, injectRouterMock } from 'vue-router-mock'
import RoomTypes from '@/pages/RoomTypes.vue'
import { roomTypeService, dormitoryService } from '@/services/api'

// Mock the API services
vi.mock('@/services/api', () => ({
  roomTypeService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  dormitoryService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock useToast composable
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
    showConfirmation: vi.fn().mockResolvedValue(true)
  })
}))

describe('RoomTypes.vue', () => {
  let wrapper: any
  let router: any

  const mockRoomTypes = [
    {
      id: 1,
      name: 'Standard',
      description: 'Standard dormitory room',
      dormitory_id: 1,
      dormitory: { id: 1, name: 'Main Dormitory' },
      bed_count: 4,
      capacity: 4,
      base_price: 400.00,
      minimap: '[{"x": 10, "y": 10}, {"x": 20, "y": 20}]',
      photos: ['photo1.jpg', 'photo2.jpg']
    },
    {
      id: 2,
      name: 'Premium',
      description: 'Premium room with amenities',
      dormitory_id: 1,
      dormitory: { id: 1, name: 'Main Dormitory' },
      bed_count: 2,
      capacity: 2,
      base_price: 600.00,
      minimap: '[{"x": 15, "y": 15}]',
      photos: []
    }
  ]

  const mockDormitories = [
    { id: 1, name: 'Main Dormitory' },
    { id: 2, name: 'North Dormitory' }
  ]

  beforeEach(() => {
    router = createRouterMock()
    injectRouterMock(router)
    
    vi.mocked(roomTypeService.getAll).mockResolvedValue({ data: mockRoomTypes })
    vi.mocked(dormitoryService.getAll).mockResolvedValue({ data: mockDormitories })
    
    wrapper = mount(RoomTypes, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ]
      }
    })
  })

  it('renders room types page correctly', () => {
    expect(wrapper.findComponent({ name: 'Navigation' }).exists()).toBe(true)
    expect(wrapper.text()).toContain('Add Room Type')
  })

  it('loads data on mount', async () => {
    const mockRoomTypeGetAll = vi.mocked(roomTypeService.getAll)
    const mockDormitoryGetAll = vi.mocked(dormitoryService.getAll)

    await wrapper.vm.$nextTick()

    expect(mockRoomTypeGetAll).toHaveBeenCalled()
    expect(mockDormitoryGetAll).toHaveBeenCalled()
  })

  it('displays loading state', async () => {
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Loading...')
  })

  it('displays error state', async () => {
    wrapper.vm.error = 'Failed to load room types data'
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Failed to load room types data')
  })

  it('filters room types by dormitory', async () => {
    wrapper.vm.roomTypes = mockRoomTypes
    wrapper.vm.filters.dormitory = '1'
    await wrapper.vm.$nextTick()

    const filteredRoomTypes = wrapper.vm.filteredRoomTypes
    expect(filteredRoomTypes).toEqual(mockRoomTypes)
  })

  it('creates new room type', async () => {
    const mockCreate = vi.mocked(roomTypeService.create)
    const newRoomTypeData = {
      name: 'Deluxe',
      description: 'Deluxe room with all amenities',
      base_price: 800.00,
      capacity: 1,
      amenities: ['Bed', 'Desk', 'Private Bathroom', 'AC', 'WiFi', 'Kitchenette']
    }
    mockCreate.mockResolvedValue({ data: { id: 3, ...newRoomTypeData } })

    await wrapper.vm.createRoomType(newRoomTypeData)

    expect(mockCreate).toHaveBeenCalledWith(newRoomTypeData)
  })

  it('updates existing room type', async () => {
    const mockUpdate = vi.mocked(roomTypeService.update)
    mockUpdate.mockResolvedValue({ data: { ...mockRoomTypes[0], base_price: 450.00 } })

    const updatedRoomType = { ...mockRoomTypes[0], base_price: 450.00 }

    await wrapper.vm.updateRoomType(1, updatedRoomType)

    expect(mockUpdate).toHaveBeenCalledWith(1, updatedRoomType)
  })

  it('deletes room type', async () => {
    const mockDelete = vi.mocked(roomTypeService.delete)
    mockDelete.mockResolvedValue({ data: { message: 'Room type deleted' } })

    await wrapper.vm.deleteRoomType(1)

    expect(mockDelete).toHaveBeenCalledWith(1)
  })

  it('handles API errors gracefully', async () => {
    const mockGetAll = vi.mocked(roomTypeService.getAll)
    mockGetAll.mockRejectedValue(new Error('API Error'))

    await wrapper.vm.loadRoomTypes()

    expect(wrapper.vm.error).toBe('Failed to load room types')
    expect(wrapper.vm.loading).toBe(false)
  })

  it('paginates room types correctly', async () => {
    const manyRoomTypes = Array.from({ length: 25 }, (_, i) => ({
      ...mockRoomTypes[0],
      id: i + 1,
      name: `Room Type ${i + 1}`
    }))

    wrapper.vm.roomTypes = manyRoomTypes
    wrapper.vm.itemsPerPage = 10
    wrapper.vm.currentPage = 1
    await wrapper.vm.$nextTick()

    const paginatedRoomTypes = wrapper.vm.paginatedRoomTypes
    expect(paginatedRoomTypes).toHaveLength(10)
    expect(paginatedRoomTypes[0].id).toBe(1)
  })

  it('calculates average price correctly', async () => {
    wrapper.vm.roomTypes = mockRoomTypes
    await wrapper.vm.$nextTick()

    const average = wrapper.vm.averagePrice
    expect(average).toBe(500.00)
  })

  it('shows room type form modal', async () => {
    await wrapper.vm.showRoomTypeForm()
    expect(wrapper.vm.showForm).toBe(true)
  })

  it('closes room type form modal', async () => {
    wrapper.vm.showForm = true
    await wrapper.vm.closeRoomTypeForm()
    expect(wrapper.vm.showForm).toBe(false)
  })

  it('handles form submission', async () => {
    const mockCreate = vi.mocked(roomTypeService.create)
    const formData = {
      name: 'Deluxe',
      description: 'Deluxe room with all amenities',
      base_price: 800.00,
      capacity: 1,
      amenities: ['Bed', 'Desk', 'Private Bathroom', 'AC', 'WiFi', 'Kitchenette']
    }
    mockCreate.mockResolvedValue({ data: { id: 3, ...formData } })

    await wrapper.vm.handleFormSubmit(formData)

    expect(mockCreate).toHaveBeenCalledWith(formData)
    expect(wrapper.vm.showForm).toBe(false)
  })

  it('formats price correctly', () => {
    expect(wrapper.vm.formatPrice(500.00)).toBe('$500.00')
    expect(wrapper.vm.formatPrice(1200.50)).toBe('$1,200.50')
  })

  it('formats amenities list', () => {
    const amenities = ['Bed', 'Desk', 'WiFi']
    expect(wrapper.vm.formatAmenities(amenities)).toBe('Bed, Desk, WiFi')
  })

  it('gets capacity range color', () => {
    expect(wrapper.vm.getCapacityColor(1)).toBe('blue')
    expect(wrapper.vm.getCapacityColor(2)).toBe('green')
    expect(wrapper.vm.getCapacityColor(4)).toBe('orange')
    expect(wrapper.vm.getCapacityColor(6)).toBe('red')
  })

  it('sorts room types by price', async () => {
    wrapper.vm.roomTypes = mockRoomTypes
    wrapper.vm.sortBy = 'price'
    wrapper.vm.sortOrder = 'asc'
    await wrapper.vm.$nextTick()

    const sortedRoomTypes = wrapper.vm.sortedRoomTypes
    expect(sortedRoomTypes[0].base_price).toBe(400.00)
    expect(sortedRoomTypes[1].base_price).toBe(600.00)
  })

  it('sorts room types by capacity', async () => {
    wrapper.vm.roomTypes = mockRoomTypes
    wrapper.vm.sortBy = 'capacity'
    wrapper.vm.sortOrder = 'desc'
    await wrapper.vm.$nextTick()

    const sortedRoomTypes = wrapper.vm.sortedRoomTypes
    expect(sortedRoomTypes[0].capacity).toBe(4)
    expect(sortedRoomTypes[1].capacity).toBe(2)
  })
})
