import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing';
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
  },
  configurationService: {
    getCurrency: vi.fn().mockResolvedValue({ data: { currency_symbol: '$' } })
  },
}))

// Mock useToast composable
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
    showConfirmation: vi.fn().mockResolvedValue(true)
  })
}))

// Mock Navigation component
vi.mock('@/components/CNavigation.vue', () => ({
  default: {
    name: 'Navigation',
    template: '<div class="navigation"><slot></slot></div>',
    props: ['title']
  }
}))

describe('RoomTypes.vue', () => {
  let wrapper: any
  let router: any

  const mockRoomTypes = [
    {
      id: 1,
      name: 'standard',
      description: 'Standard dormitory room',
      capacity: 2,
      daily_rate: 25.00,
      semester_rate: 1500.00,
      minimap: '[{"x": 10, "y": 10}, {"x": 20, "y": 20}]',
      photos: ['photo1.jpg', 'photo2.jpg'],
      dormitory_id: 1
    },
    {
      id: 2,
      name: 'lux',
      description: 'Premium room with amenities',
      capacity: 1,
      daily_rate: 50.00,
      semester_rate: 3000.00,
      minimap: '[{"x": 15, "y": 15}]',
      photos: [],
      dormitory_id: 2
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
    expect(filteredRoomTypes).toEqual([mockRoomTypes[0]]) // Only room type with dormitory_id=1
  })

  it('creates new room type', async () => {
    const mockCreate = vi.mocked(roomTypeService.create)
    const newRoomTypeData = {
      name: 'standard',
      description: 'Standard room with amenities',
      daily_rate: 25.00,
      semester_rate: 1500.00,
      capacity: 2
    }
    mockCreate.mockResolvedValue({ data: { id: 3, ...newRoomTypeData } })

    await wrapper.vm.createRoomType(newRoomTypeData)

    expect(mockCreate).toHaveBeenCalledWith(newRoomTypeData)
  })

  it('updates existing room type', async () => {
    const mockUpdate = vi.mocked(roomTypeService.update)
    mockUpdate.mockResolvedValue({ data: { ...mockRoomTypes[0], daily_rate: 30.00 } })

    const updatedRoomType = { ...mockRoomTypes[0], daily_rate: 30.00 }

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
      name: i % 2 === 0 ? 'standard' : 'lux'
    }))

    wrapper.vm.roomTypes = manyRoomTypes
    wrapper.vm.itemsPerPage = 10
    wrapper.vm.currentPage = 1
    await wrapper.vm.$nextTick()

    const paginatedRoomTypes = wrapper.vm.paginatedRoomTypes
    expect(paginatedRoomTypes).toHaveLength(10)
    expect(paginatedRoomTypes[0].id).toBe(1)
  })

  it('calculates average semester rate correctly', async () => {
    wrapper.vm.roomTypes = mockRoomTypes
    await wrapper.vm.$nextTick()

    const average = wrapper.vm.averageSemesterRate
    expect(average).toBe(2250.00) // (1500 + 3000) / 2
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
      name: 'standard',
      description: 'Standard room with amenities',
      daily_rate: 25.00,
      semester_rate: 1500.00,
      capacity: 2
    }
    mockCreate.mockResolvedValue({ data: { id: 3, ...formData } })

    await wrapper.vm.handleFormSubmit(formData)

    expect(mockCreate).toHaveBeenCalledWith(formData)
    expect(wrapper.vm.showForm).toBe(false)
  })

  it('formats price correctly', () => {
    expect(wrapper.vm.formatPrice(500.00)).toBe('$500.00');
    expect(wrapper.vm.formatPrice(1200.50)).toBe('$1,200.50');
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

  it('sorts room types by daily rate', async () => {
    wrapper.vm.roomTypes = mockRoomTypes
    wrapper.vm.sortBy = 'daily_rate'
    wrapper.vm.sortOrder = 'asc'
    await wrapper.vm.$nextTick()

    const sortedRoomTypes = wrapper.vm.sortedRoomTypes
    expect(sortedRoomTypes[0].daily_rate).toBe(25.00)
    expect(sortedRoomTypes[1].daily_rate).toBe(50.00)
  })

  it('sorts room types by capacity', async () => {
    wrapper.vm.roomTypes = mockRoomTypes
    wrapper.vm.sortBy = 'capacity'
    wrapper.vm.sortOrder = 'desc'
    await wrapper.vm.$nextTick()

    const sortedRoomTypes = wrapper.vm.sortedRoomTypes
    expect(sortedRoomTypes[0].capacity).toBe(2)
    expect(sortedRoomTypes[1].capacity).toBe(1)
  })

  it('displays room type names capitalized', async () => {
    // Mock the API response and call the component's load function
    const mockGetAll = vi.mocked(roomTypeService.getAll)
    mockGetAll.mockResolvedValue({ data: mockRoomTypes })
    
    // Call loadRoomTypes and wait for it to complete
    await wrapper.vm.loadRoomTypes()
    
    // Wait for the component to update
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    // Verify the data was loaded
    expect(wrapper.vm.roomTypes).toEqual(mockRoomTypes)
    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.error).toBe(null)

    // Look for the capitalized text content instead of CSS class
    const roomTypeNames = wrapper.findAll('td').filter(td => 
      td.text().includes('Standard') || td.text().includes('Lux')
    )
    expect(roomTypeNames.length).toBeGreaterThan(0)
    
    // Check that the first room type name is capitalized
    const firstRoomTypeCell = wrapper.findAll('td')[0]
    expect(firstRoomTypeCell.text()).toBe('Standard')
    
    // Check that the second room type name is capitalized  
    const secondRoomTypeCell = wrapper.findAll('td')[5] // Skip to second row
    expect(secondRoomTypeCell.text()).toContain('Lux')
  })

  it('displays capacity and price correctly', async () => {
    // Mock the API response and call the component's load function
    const mockGetAll = vi.mocked(roomTypeService.getAll)
    mockGetAll.mockResolvedValue({ data: mockRoomTypes })
    
    // Call loadRoomTypes and wait for it to complete
    await wrapper.vm.loadRoomTypes()
    
    // Wait for the component to update
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    // Verify the data was loaded
    expect(wrapper.vm.roomTypes).toEqual(mockRoomTypes)
    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.error).toBe(null)

    const cells = wrapper.findAll('td')
    expect(cells.length).toBeGreaterThan(0)
    expect(cells[1].text()).toBe('2') // capacity for standard
    expect(cells[2].text()).toContain('25.00') // daily_rate for standard
    expect(cells[3].text()).toContain('1,500.00') // semester_rate for standard
    expect(cells[6].text()).toBe('1') // capacity for lux
    expect(cells[7].text()).toContain('50.00') // daily_rate for lux
    expect(cells[8].text()).toContain('3,000.00') // semester_rate for lux
  })
})
