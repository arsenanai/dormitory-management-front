// Add URL polyfill at the very top (if needed)
globalThis.URL = globalThis.URL || require('url').URL

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import api from '@/services/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('user store', () => {
  let store: any

  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      role_id: 2,
      student_profile: {
        user_id: 1,
        iin: '990101123456',
        faculty: 'Engineering',
        course: 2,
        year_of_study: 2,
        gender: 'male',
        parent_name: 'Jane Doe',
        parent_phone: '+1234567891',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '+1234567891',
      },
      room_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
      role_id: 1,
      admin_profile: {
        user_id: 2,
        position: 'Head of Dormitory',
        department: 'Administration',
        office_phone: '+1234567892',
        office_location: 'Building A',
      },
      room_id: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: 'Guest User',
      email: 'guest@example.com',
      role: 'guest',
      role_id: 3,
      guest_profile: {
        user_id: 3,
        room_type: 'single',
        files: ['passport.pdf'],
      },
      room_id: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]
  
  // Setup before each test
  beforeEach(() => {
    // Create a fresh Pinia instance and set it as active
    setActivePinia(createPinia())
    
    // Get a fresh store instance
    store = useUserStore()
    
    // Reset store state to initial values
    store.$reset()
    
    // Reset API mocks
    vi.resetAllMocks()
  })
  
  // Clean up after each test
  afterEach(() => {
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useUserStore()
  })

  it('initializes with default state', () => {
    expect(store.users).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })

  it('fetches users successfully', async () => {
    const mockGet = vi.mocked(api.get)
    mockGet.mockResolvedValue({ data: mockUsers })

    await store.fetchUsers()

    expect(mockGet).toHaveBeenCalledWith('/users')
    expect(store.users).toEqual(mockUsers)
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
    // Check that student_profile is present for student
    expect(store.users[0].student_profile).toBeDefined()
    expect(store.users[1].admin_profile).toBeDefined()
    expect(store.users[2].guest_profile).toBeDefined()
  })

  it('handles fetch users error', async () => {
    const mockGet = vi.mocked(api.get)
    mockGet.mockRejectedValue(new Error('API Error'))

    try {
      await store.fetchUsers()
    } catch (error) {
      expect(error.message).toBe('API Error')
    }

    expect(store.users).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe('Failed to fetch users')
  })

  it('fetches single user successfully', async () => {
    const mockGet = vi.mocked(api.get)
    mockGet.mockResolvedValue({ data: mockUsers[0] })

    const result = await store.fetchUser(1)

    expect(mockGet).toHaveBeenCalledWith('/users/1')
    expect(result).toEqual(mockUsers[0])
  })

  it('handles fetch single user error', async () => {
    const mockGet = vi.mocked(api.get)
    mockGet.mockRejectedValue(new Error('API Error'))

    const result = await store.fetchUser(1)

    expect(result).toBe(null)
    expect(store.error).toBe('Failed to fetch user')
  })

  it('creates user successfully', async () => {
    const mockPost = vi.mocked(api.post)
    const newUser = {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'student',
      role_id: 2,
      student_profile: {
        user_id: 4,
        iin: '990101123457',
        faculty: 'Science',
        course: 1,
        year_of_study: 1,
        gender: 'male',
        parent_name: 'Alice Johnson',
        parent_phone: '+1234567896',
        emergency_contact_name: 'Alice Johnson',
        emergency_contact_phone: '+1234567896',
      },
      room_id: 2,
    }
    mockPost.mockResolvedValue({ data: { id: 4, ...newUser } })

    const result = await store.createUser(newUser)

    expect(mockPost).toHaveBeenCalledWith('/users', newUser)
    expect(result).toEqual({ id: 4, ...newUser })
    expect(store.users).toContainEqual({ id: 4, ...newUser })
  })

  it('handles create user error', async () => {
    const mockPost = vi.mocked(api.post)
    mockPost.mockRejectedValue(new Error('API Error'))

    const newUser = {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'student',
      role_id: 2,
      student_profile: {
        user_id: 4,
        iin: '990101123457',
        faculty: 'Science',
        course: 1,
        year_of_study: 1,
        gender: 'male',
        parent_name: 'Alice Johnson',
        parent_phone: '+1234567896',
        emergency_contact_name: 'Alice Johnson',
        emergency_contact_phone: '+1234567896',
      },
      room_id: 2,
    }

    const result = await store.createUser(newUser)

    expect(result).toBe(null)
    expect(store.error).toBe('Failed to create user')
  })

  it('updates user successfully', async () => {
    store.users = mockUsers
    const mockPut = vi.mocked(api.put)
    const updatedData = { ...mockUsers[0], name: 'John Updated' }
    mockPut.mockResolvedValue({ data: updatedData })

    const result = await store.updateUser(1, { name: 'John Updated' })

    expect(mockPut).toHaveBeenCalledWith('/users/1', { name: 'John Updated' })
    expect(result).toEqual(updatedData)
    expect(store.users[0].name).toBe('John Updated')
  })

  it('handles update user error', async () => {
    store.users = mockUsers
    const mockPut = vi.mocked(api.put)
    mockPut.mockRejectedValue(new Error('API Error'))

    const result = await store.updateUser(1, { name: 'John Updated' })

    expect(result).toBe(null)
    expect(store.error).toBe('Failed to update user')
  })

  it('deletes user successfully', async () => {
    store.users = mockUsers
    const mockDelete = vi.mocked(api.delete)
    mockDelete.mockResolvedValue({ data: { message: 'User deleted' } })

    const result = await store.deleteUser(1)

    expect(mockDelete).toHaveBeenCalledWith('/users/1')
    expect(result).toBe(true)
    expect(store.users).not.toContainEqual(mockUsers[0])
  })

  it('handles delete user error', async () => {
    store.users = mockUsers
    const mockDelete = vi.mocked(api.delete)
    mockDelete.mockRejectedValue(new Error('API Error'))

    const result = await store.deleteUser(1)

    expect(result).toBe(false)
    expect(store.error).toBe('Failed to delete user')
    expect(store.users).toContainEqual(mockUsers[0])
  })

  it('gets user by id', () => {
    store.users = mockUsers
    const user = store.getUserById(1)
    expect(user).toEqual(mockUsers[0])
  })

  it('returns null for non-existent user', () => {
    store.users = mockUsers
    const user = store.getUserById(999)
    expect(user).toBe(null)
  })

  it('filters users by role', () => {
    store.users = mockUsers
    const students = store.getUsersByRole('student')
    expect(students).toHaveLength(1)
    expect(students[0].role).toBe('student')
    expect(students[0].student_profile).toBeDefined()
    const admins = store.getUsersByRole('admin')
    expect(admins).toHaveLength(1)
    expect(admins[0].role).toBe('admin')
    expect(admins[0].admin_profile).toBeDefined()
    const guests = store.getUsersByRole('guest')
    expect(guests).toHaveLength(1)
    expect(guests[0].role).toBe('guest')
    expect(guests[0].guest_profile).toBeDefined()
  })

  it('filters users by search term', () => {
    // Use completely fresh data for this test
    const freshMockUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        role_id: 2,
        student_profile: {
          user_id: 1,
          iin: '990101123456',
          faculty: 'Engineering',
          course: 2,
          year_of_study: 2,
          gender: 'male',
          parent_name: 'Jane Doe',
          parent_phone: '+1234567891',
          emergency_contact_name: 'Jane Doe',
          emergency_contact_phone: '+1234567891',
        },
        room_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin',
        role_id: 1,
        admin_profile: {
          user_id: 2,
          position: 'Head of Dormitory',
          department: 'Administration',
          office_phone: '+1234567892',
          office_location: 'Building A',
        },
        room_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
    store.users = freshMockUsers
    const filtered = store.filterUsers('John')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('John Doe')
    expect(filtered[0].student_profile).toBeDefined()
  })

  it('filters users by gender', () => {
    store.users = mockUsers
    const maleUsers = store.filterByGender('male')
    expect(maleUsers).toHaveLength(1)
    expect(maleUsers[0].student_profile?.gender).toBe('male')
    const femaleUsers = store.filterByGender('female')
    expect(femaleUsers).toHaveLength(0)
  })

  it('gets users with rooms', () => {
    store.users = mockUsers
    const usersWithRooms = store.getUsersWithRooms()
    expect(usersWithRooms).toHaveLength(1)
    expect(usersWithRooms[0].room_id).toBe(1)
  })

  it('gets users without rooms', () => {
    store.users = mockUsers
    const usersWithoutRooms = store.getUsersWithoutRooms()
    expect(usersWithoutRooms).toHaveLength(2)
    expect(usersWithoutRooms[0].room_id).toBe(null)
    expect(usersWithoutRooms[1].room_id).toBe(null)
  })

  it('calculates user statistics', () => {
    store.users = JSON.parse(JSON.stringify(mockUsers))
    const stats = store.userStats
    expect(stats.total).toBe(3)
    expect(stats.students).toBe(1)
    expect(stats.admins).toBe(1)
    // userStats getter only returns total, students, admins - not withRooms/withoutRooms
  })

  it('sorts users by name', () => {
    // Use completely fresh data for this test
    const freshMockUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        role_id: 2,
        student_profile: {
          user_id: 1,
          iin: '990101123456',
          faculty: 'Engineering',
          course: 2,
          year_of_study: 2,
          gender: 'male',
          parent_name: 'Jane Doe',
          parent_phone: '+1234567891',
          emergency_contact_name: 'Jane Doe',
          emergency_contact_phone: '+1234567891',
        },
        room_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin',
        role_id: 1,
        admin_profile: {
          user_id: 2,
          position: 'Head of Dormitory',
          department: 'Administration',
          office_phone: '+1234567892',
          office_location: 'Building A',
        },
        room_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
    store.users = freshMockUsers
    const sorted = store.sortUsers('name', 'asc')
    expect(sorted[0].name).toBe('Jane Smith')
    expect(sorted[1].name).toBe('John Doe')
  })

  it('sorts users by created date', () => {
    const usersWithDates = [
      { ...mockUsers[0], created_at: '2024-01-01T00:00:00Z' },
      { ...mockUsers[1], created_at: '2024-01-02T00:00:00Z' }
    ]
    store.users = usersWithDates
    
    const sorted = store.sortUsers('created_at', 'desc')
    expect(sorted[0].created_at).toBe('2024-01-02T00:00:00Z')
    expect(sorted[1].created_at).toBe('2024-01-01T00:00:00Z')
  })

  it('validates user data', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      student_profile: {
        user_id: 1,
        iin: '990101123456',
      }
    }
    expect(store.validateUser(validUser)).toBe(true)
    const invalidUser = {
      name: '',
      email: 'invalid-email',
      role: '',
      student_profile: {}
    }
    expect(store.validateUser(invalidUser)).toBe(false)
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
