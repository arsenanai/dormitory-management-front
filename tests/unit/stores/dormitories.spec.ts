// Add URL polyfill at the very top
globalThis.URL = globalThis.URL || require('url').URL

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDormitoriesStore } from '@/stores/dormitories'
import api, { dormitoryService } from '@/services/api'

// Helper function to create mock Axios responses
import { AxiosResponse } from 'axios'
function createAxiosResponse(data: any): AxiosResponse {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: {} }
  } as AxiosResponse
}

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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

describe('dormitories store', () => {
  let store: any

  beforeEach(() => {
    // Create fresh Pinia instance
    setActivePinia(createPinia())
    // Reset all mocks
    vi.clearAllMocks()
    // Get store instance
    store = useDormitoriesStore()
  })
  
  afterEach(() => {
    // Restore all mocks
    vi.restoreAllMocks()
  })

  const mockDormitories = [
    {
      id: 1,
      name: 'Main Dormitory',
      address: '123 Campus Drive',
      city: 'College Town',
      state: 'CA',
      postal_code: '12345',
      phone: '+1234567890',
      email: 'main@university.edu',
      capacity: 200,
      current_occupancy: 150,
      amenities: ['WiFi', 'Laundry', 'Kitchen', 'Study Room'],
      rules: 'No smoking, No pets, Quiet hours 10pm-6am',
      manager_name: 'John Manager',
      manager_phone: '+1234567891',
      manager_email: 'manager@university.edu'
    },
    {
      id: 2,
      name: 'North Dormitory',
      address: '456 North Street',
      city: 'College Town',
      state: 'CA',
      postal_code: '12345',
      phone: '+1234567892',
      email: 'north@university.edu',
      capacity: 150,
      current_occupancy: 100,
      amenities: ['WiFi', 'Laundry', 'Parking'],
      rules: 'No smoking, No pets',
      manager_name: 'Jane Manager',
      manager_phone: '+1234567893',
      manager_email: 'jane@university.edu'
    }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useDormitoriesStore()
  })

  it('initializes with default state', () => {
    expect(store.dormitories).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })

  it('fetches dormitories successfully', async () => {
    const mockGetAll = vi.mocked(dormitoryService.getAll)
    mockGetAll.mockResolvedValue(createAxiosResponse(mockDormitories))

    await store.fetchDormitories()

    expect(mockGetAll).toHaveBeenCalled()
    expect(store.dormitories).toEqual(mockDormitories)
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })

  it('handles fetch dormitories error', async () => {
    const mockGetAll = vi.mocked(dormitoryService.getAll)
    mockGetAll.mockRejectedValue(new Error('API Error'))

    await store.fetchDormitories()

    expect(store.dormitories).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe('Failed to fetch dormitories')
  })

  it('fetches single dormitory successfully', async () => {
    const mockGetById = vi.mocked(dormitoryService.getById)
    mockGetById.mockResolvedValue(createAxiosResponse(mockDormitories[0]))

    const result = await store.fetchDormitory(1)

    expect(mockGetById).toHaveBeenCalledWith(1)
    expect(result).toEqual(mockDormitories[0])
  })

  it('handles fetch single dormitory error', async () => {
    const mockGetById = vi.mocked(dormitoryService.getById)
    mockGetById.mockRejectedValue(new Error('API Error'))

    const result = await store.fetchDormitory(1)

    expect(result).toBe(null)
    expect(store.error).toBe('Failed to fetch dormitory')
  })

  it('creates dormitory successfully', async () => {
    const mockCreate = vi.mocked(dormitoryService.create)
    const newDormitory = {
      name: 'South Dormitory',
      address: '789 South Ave',
      city: 'College Town',
      state: 'CA',
      postal_code: '12345',
      phone: '+1234567894',
      email: 'south@university.edu',
      capacity: 100
    }
    mockCreate.mockResolvedValue(createAxiosResponse({ id: 3, ...newDormitory }))

    const result = await store.createDormitory(newDormitory)

    expect(mockCreate).toHaveBeenCalledWith(newDormitory)
    expect(result).toEqual({ id: 3, ...newDormitory })
    expect(store.dormitories).toContainEqual({ id: 3, ...newDormitory })
  })

  it('handles create dormitory error', async () => {
    const mockCreate = vi.mocked(dormitoryService.create)
    mockCreate.mockRejectedValue(new Error('API Error'))

    const newDormitory = {
      name: 'South Dormitory',
      address: '789 South Ave',
      city: 'College Town',
      state: 'CA',
      postal_code: '12345',
      phone: '+1234567894',
      email: 'south@university.edu',
      capacity: 100
    }

    const result = await store.createDormitory(newDormitory)

    expect(result).toBe(null)
    expect(store.error).toBe('Failed to create dormitory')
  })

  it('updates dormitory successfully', async () => {
    store.dormitories = mockDormitories
    const mockUpdate = vi.mocked(dormitoryService.update)
    const updatedData = { ...mockDormitories[0], name: 'Updated Main Dormitory' }
    mockUpdate.mockResolvedValue(createAxiosResponse(updatedData))

    const result = await store.updateDormitory(1, { name: 'Updated Main Dormitory' })

    expect(mockUpdate).toHaveBeenCalledWith(1, { name: 'Updated Main Dormitory' })
    expect(result).toEqual(updatedData)
    expect(store.dormitories[0].name).toBe('Updated Main Dormitory')
  })

  it('handles update dormitory error', async () => {
    store.dormitories = mockDormitories
    const mockUpdate = vi.mocked(dormitoryService.update)
    mockUpdate.mockRejectedValue(new Error('API Error'))

    const result = await store.updateDormitory(1, { name: 'Updated Main Dormitory' })

    expect(result).toBe(null)
    expect(store.error).toBe('Failed to update dormitory')
  })

  it('deletes dormitory successfully', async () => {
    // Create a fresh copy of the mockDormitories array to avoid shared state
    store.dormitories = JSON.parse(JSON.stringify(mockDormitories))
    const dormitoryToDelete = {...mockDormitories[0]}
    
    const mockDelete = vi.mocked(dormitoryService.delete)
    mockDelete.mockResolvedValue(createAxiosResponse({ message: 'Dormitory deleted' }))

    const result = await store.deleteDormitory(1)

    expect(mockDelete).toHaveBeenCalledWith(1)
    expect(result).toBe(true)
    expect(store.dormitories).not.toContainEqual(dormitoryToDelete)
  })

  it('handles delete dormitory error', async () => {
    store.dormitories = mockDormitories
    const mockDelete = vi.mocked(dormitoryService.delete)
    mockDelete.mockRejectedValue(new Error('API Error'))

    const result = await store.deleteDormitory(1)

    expect(result).toBe(false)
    expect(store.error).toBe('Failed to delete dormitory')
    expect(store.dormitories).toContainEqual(mockDormitories[0])
  })

  it('gets dormitory by id', () => {
    // Create a fresh copy of the mockDormitories array to avoid shared state
    store.dormitories = JSON.parse(JSON.stringify(mockDormitories))
    const dormitory = store.getDormitoryById(1)
    expect(dormitory).toEqual(mockDormitories[0])
  })

  it('returns null for non-existent dormitory', () => {
    store.dormitories = mockDormitories
    const dormitory = store.getDormitoryById(999)
    expect(dormitory).toBe(null)
  })

  it('calculates total capacity correctly', () => {
    // Create a fresh copy of the mockDormitories array to avoid shared state
    store.dormitories = JSON.parse(JSON.stringify(mockDormitories))
    // Total capacity: 200 + 150 = 350
    expect(store.totalCapacity).toBe(350)
  })

  it('calculates total occupancy correctly', () => {
    // Create a fresh copy of the mockDormitories array to avoid shared state
    store.dormitories = JSON.parse(JSON.stringify(mockDormitories))
    // Total occupancy: 150 + 100 = 250
    expect(store.totalOccupancy).toBe(250)
  })

  it('calculates occupancy rate correctly', () => {
    // Create a fresh copy of the mockDormitories array to avoid shared state
    store.dormitories = JSON.parse(JSON.stringify(mockDormitories))
    // Occupancy rate: (250 / 350) * 100 = 71.43%
    expect(store.occupancyRate).toBeCloseTo(71.43, 2)
  })

  it('calculates available capacity correctly', () => {
    // Create a fresh copy of the mockDormitories array to avoid shared state
    store.dormitories = JSON.parse(JSON.stringify(mockDormitories))
    // Available capacity: 350 - 250 = 100
    expect(store.availableCapacity).toBe(100)
  })

  it('filters dormitories by search term', () => {
    store.dormitories = mockDormitories
    const filtered = store.filterDormitories('Main')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('Main Dormitory')
  })

  it('filters dormitories by city', () => {
    store.dormitories = mockDormitories
    const filtered = store.filterDormitories('College Town')
    expect(filtered).toHaveLength(2)
  })

  it('filters dormitories by capacity range', () => {
    store.dormitories = mockDormitories
    const filtered = store.filterByCapacity(180, 250)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].capacity).toBe(200)
  })

  it('sorts dormitories by name', () => {
    store.dormitories = mockDormitories
    const sorted = store.sortDormitories('name', 'asc')
    expect(sorted[0].name).toBe('Main Dormitory')
    expect(sorted[1].name).toBe('North Dormitory')
  })

  it('sorts dormitories by capacity descending', () => {
    store.dormitories = mockDormitories
    const sorted = store.sortDormitories('capacity', 'desc')
    expect(sorted[0].capacity).toBe(200)
    expect(sorted[1].capacity).toBe(150)
  })

  it('clears error state', () => {
    store.error = 'Some error'
    store.clearError()
    expect(store.error).toBe(null)
  })

  it('sets loading state', () => {
    store.setLoading(true)
    expect(store.loading).toBe(true)
    
    store.setLoading(false)
    expect(store.loading).toBe(false)
  })
})
