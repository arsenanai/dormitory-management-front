import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouterMock, injectRouterMock } from 'vue-router-mock'
import Users from '@/pages/Users.vue'
import { userService, dormitoryService } from '@/services/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  userService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  dormitoryService: {
    getAll: vi.fn()
  }
}))

describe('Users.vue', () => {
  let wrapper: any
  let router: any

  // Helper function to create mock Axios response
  const createMockAxiosResponse = (data: any) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers: {} as any
    }
  } as any)

  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      phone: '+1234567890',
      address: '123 Main St',
      date_of_birth: '1995-05-15',
      gender: 'male',
      nationality: 'US',
      emergency_contact: 'Jane Doe (+1234567891)',
      room_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
      phone: '+1234567892',
      address: '456 Oak Ave',
      date_of_birth: '1988-08-22',
      gender: 'female',
      nationality: 'CA',
      emergency_contact: 'Bob Smith (+1234567893)',
      room_id: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up default mocks
    const mockGetAll = vi.mocked(userService.getAll)
    const mockDormitoryGetAll = vi.mocked(dormitoryService.getAll)
    
    mockGetAll.mockResolvedValue(createMockAxiosResponse([]))
    mockDormitoryGetAll.mockResolvedValue(createMockAxiosResponse([]))
    
    router = createRouterMock()
    injectRouterMock(router)
    
    wrapper = mount(Users, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ],
        stubs: {
          Navigation: { 
            template: '<div><slot /></div>' 
          },
          CInput: { 
            template: '<input v-model="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />', 
            props: ['modelValue'],
            emits: ['update:modelValue']
          },
          CSelect: { 
            template: '<select v-model="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option value="">All</option></select>',
            props: ['modelValue', 'options'],
            emits: ['update:modelValue']
          },
          CButton: { 
            template: '<button @click="$emit(\'click\')" :data-testid="$attrs[\'data-testid\']"><slot /></button>'
          },
          CTable: { template: '<table><slot /></table>' },
          CTableHead: { template: '<thead><slot /></thead>' },
          CTableHeadCell: { template: '<th><slot /></th>' },
          CTableBody: { template: '<tbody><slot /></tbody>' },
          CTableRow: { template: '<tr><slot /></tr>' },
          CTableCell: { template: '<td><slot /></td>' },
          PencilSquareIcon: { template: '<span>📝</span>' }
        }
      }
    })
    
    // Reset component state
    wrapper.vm.users = []
    wrapper.vm.searchTerm = ''
    wrapper.vm.roleFilter = ''
    wrapper.vm.genderFilter = ''
    wrapper.vm.sortBy = 'name'
    wrapper.vm.sortOrder = 'asc'
    wrapper.vm.currentPage = 1
  })

  it('renders users page correctly', () => {
    expect(wrapper.find('h1').text()).toBe('Users')
    expect(wrapper.find('[data-testid="add-user-button"], button').text()).toContain('Add User')
  })

  it('loads users on mount', async () => {
    const mockGetAll = vi.mocked(userService.getAll)
    mockGetAll.mockResolvedValue(createMockAxiosResponse(mockUsers))

    await wrapper.vm.loadUsers()

    expect(mockGetAll).toHaveBeenCalled()
    expect(wrapper.vm.users).toEqual(mockUsers)
  })

  it('handles loading state', async () => {
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.loading-text').exists()).toBe(true)
  })

  it('handles error state', async () => {
    wrapper.vm.error = 'Failed to load users'
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-message').text()).toBe('Failed to load users')
  })

  it('filters users by search term', async () => {
    wrapper.vm.users = mockUsers
    wrapper.vm.searchTerm = 'John'
    await wrapper.vm.$nextTick()

    const filteredUsers = wrapper.vm.filteredUsers
    expect(filteredUsers).toHaveLength(1)
    expect(filteredUsers[0].name).toBe('John Doe')
  })

  it('filters users by role', async () => {
    wrapper.vm.users = mockUsers
    wrapper.vm.roleFilter = 'student'
    await wrapper.vm.$nextTick()

    const filteredUsers = wrapper.vm.filteredUsers
    expect(filteredUsers).toHaveLength(1)
    expect(filteredUsers[0].role).toBe('student')
  })

  it('filters users by gender', async () => {
    wrapper.vm.users = mockUsers
    wrapper.vm.genderFilter = 'female'
    await wrapper.vm.$nextTick()

    const filteredUsers = wrapper.vm.filteredUsers
    expect(filteredUsers).toHaveLength(1)
    expect(filteredUsers[0].gender).toBe('female')
  })

  it('creates new user', async () => {
    const mockCreate = vi.mocked(userService.create)
    const newUserData = {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'student',
      phone: '+1234567894',
      address: '789 Pine St',
      date_of_birth: '1997-03-10',
      gender: 'male',
      nationality: 'US',
      emergency_contact: 'Alice Johnson (+1234567895)'
    }
    mockCreate.mockResolvedValue(createMockAxiosResponse({ id: 3, ...newUserData }))

    await wrapper.vm.createUser(newUserData)

    expect(mockCreate).toHaveBeenCalledWith(newUserData)
  })

  it('updates existing user', async () => {
    const mockUpdate = vi.mocked(userService.update)
    mockUpdate.mockResolvedValue(createMockAxiosResponse({ ...mockUsers[0], phone: '+1234567899' }))

    const updatedUser = { ...mockUsers[0], phone: '+1234567899' }

    await wrapper.vm.updateUser(1, updatedUser)

    expect(mockUpdate).toHaveBeenCalledWith(1, updatedUser)
  })

  it('deletes user', async () => {
    const mockDelete = vi.mocked(userService.delete)
    mockDelete.mockResolvedValue(createMockAxiosResponse({ message: 'User deleted' }))

    await wrapper.vm.deleteUser(1)

    expect(mockDelete).toHaveBeenCalledWith(1)
  })

  it('handles API errors gracefully', async () => {
    const mockGetAll = vi.mocked(userService.getAll)
    mockGetAll.mockRejectedValue(new Error('API Error'))

    await wrapper.vm.loadUsers()

    expect(wrapper.vm.error).toBe('Failed to load users')
    expect(wrapper.vm.loading).toBe(false)
  })

  it('paginates users correctly', async () => {
    const manyUsers = Array.from({ length: 25 }, (_, i) => ({
      ...mockUsers[0],
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`
    }))

    wrapper.vm.users = manyUsers
    wrapper.vm.itemsPerPage = 10
    wrapper.vm.currentPage = 1
    await wrapper.vm.$nextTick()

    const paginatedUsers = wrapper.vm.paginatedUsers
    expect(paginatedUsers).toHaveLength(10)
    expect(paginatedUsers[0].id).toBe(1)
  })

  it('calculates user statistics', async () => {
    // Reset users array to exactly mockUsers
    wrapper.vm.users = [...mockUsers]
    await wrapper.vm.$nextTick()

    const stats = wrapper.vm.userStats
    expect(stats.total).toBe(2)
    expect(stats.students).toBe(1)
    expect(stats.admins).toBe(1)
    expect(stats.withRooms).toBe(1)
    expect(stats.withoutRooms).toBe(1)
  })

  it('shows user form modal', async () => {
    await wrapper.vm.showUserForm()
    expect(wrapper.vm.showForm).toBe(true)
  })

  it('closes user form modal', async () => {
    wrapper.vm.showForm = true
    await wrapper.vm.closeUserForm()
    expect(wrapper.vm.showForm).toBe(false)
  })

  it('handles form submission', async () => {
    const mockCreate = vi.mocked(userService.create)
    const formData = {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'student',
      phone: '+1234567894',
      address: '789 Pine St',
      date_of_birth: '1997-03-10',
      gender: 'male',
      nationality: 'US',
      emergency_contact: 'Alice Johnson (+1234567895)'
    }
    mockCreate.mockResolvedValue(createMockAxiosResponse({ id: 3, ...formData }))

    await wrapper.vm.handleFormSubmit(formData)

    expect(mockCreate).toHaveBeenCalledWith(formData)
    expect(wrapper.vm.showForm).toBe(false)
  })

  it('formats user age correctly', () => {
    const birthDate = '1995-05-15'
    const age = wrapper.vm.calculateAge(birthDate)
    expect(age).toBeGreaterThan(25)
    expect(age).toBeLessThan(35)
  })

  it('gets role color', () => {
    expect(wrapper.vm.getRoleColor('admin')).toBe('red')
    expect(wrapper.vm.getRoleColor('student')).toBe('blue')
    expect(wrapper.vm.getRoleColor('staff')).toBe('green')
  })

  it('formats phone number', () => {
    expect(wrapper.vm.formatPhone('+1234567890')).toBe('+1 (234) 567-890')
    expect(wrapper.vm.formatPhone('1234567890')).toBe('(234) 567-890')
  })

  it('validates email format', () => {
    expect(wrapper.vm.isValidEmail('test@example.com')).toBe(true)
    expect(wrapper.vm.isValidEmail('invalid-email')).toBe(false)
    expect(wrapper.vm.isValidEmail('test@')).toBe(false)
  })

  it('sorts users by name', async () => {
    wrapper.vm.users = [...mockUsers]  // Use fresh copy
    wrapper.vm.sortBy = 'name'
    wrapper.vm.sortOrder = 'asc'
    await wrapper.vm.$nextTick()

    const sortedUsers = wrapper.vm.sortedUsers
    // Jane comes before John alphabetically
    expect(sortedUsers[0].name).toBe('Jane Smith')
    expect(sortedUsers[1].name).toBe('John Doe')
  })

  it('sorts users by created date', async () => {
    const usersWithDates = [
      { ...mockUsers[0], created_at: '2024-01-01T00:00:00Z' },
      { ...mockUsers[1], created_at: '2024-01-02T00:00:00Z' }
    ]
    
    wrapper.vm.users = usersWithDates
    wrapper.vm.sortBy = 'created_at'
    wrapper.vm.sortOrder = 'desc'
    await wrapper.vm.$nextTick()

    const sortedUsers = wrapper.vm.sortedUsers
    expect(sortedUsers[0].created_at).toBe('2024-01-02T00:00:00Z')
    expect(sortedUsers[1].created_at).toBe('2024-01-01T00:00:00Z')
  })

  it('handles user search with multiple criteria', async () => {
    wrapper.vm.users = [...mockUsers]  // Use fresh copy
    wrapper.vm.searchTerm = 'john'
    wrapper.vm.roleFilter = 'student'
    wrapper.vm.genderFilter = 'male'
    await wrapper.vm.$nextTick()

    const filteredUsers = wrapper.vm.filteredUsers
    expect(filteredUsers).toHaveLength(1)
    expect(filteredUsers[0].name).toBe('John Doe')
  })
})
