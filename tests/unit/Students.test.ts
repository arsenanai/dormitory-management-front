import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'
import { defineStore } from 'pinia'
import Students from '@/pages/Students.vue'
import { studentService, roomService } from '@/services/api'
import { useToast } from '@/composables/useToast'
import type { User } from '@/models/User'

// Mock the composables and services
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showConfirmation: vi.fn().mockResolvedValue(true)
  })
}))

vi.mock('@/services/api', () => ({
  studentService: {
    getAll: vi.fn(),
    delete: vi.fn(),
    export: vi.fn()
  },
  roomService: {
    getAll: vi.fn()
  }
}))

// Mock the student store
const mockStudentStore = defineStore('student', {
  state: () => ({
    selectedStudent: null
  }),
  actions: {
    setSelectedStudent: vi.fn(),
    clearSelectedStudent: vi.fn()
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.URL for file downloads
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn()
  }
})

// Mock document.createElement for file download
Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    href: '',
    setAttribute: vi.fn(),
    click: vi.fn(),
    remove: vi.fn()
  }))
})

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log
const originalConsoleError = console.error

describe('Students.vue', () => {
  let wrapper: any
  let router: any
  let i18n: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/student-form', name: 'student-form', component: { template: '<div></div>' } },
        { path: '/student-form/:id', name: 'student-form-edit', component: { template: '<div></div>' } }
      ]
    })

    // Setup i18n
    i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {
          'Student Management': 'Student Management',
          'Search': 'Search',
          'Faculty': 'Faculty',
          'Enter Faculty Name': 'Enter Faculty Name',
          'All Rooms': 'All Rooms',
          'Room': 'Room',
          'All Statuses': 'All Statuses',
          'Status': 'Status',
          'Download': 'Download',
          'Add Student': 'Add Student',
          'STUDENT': 'STUDENT',
          'STATUS': 'STATUS',
          'ENROLMENT YEAR': 'ENROLMENT YEAR',
          'FACULTY': 'FACULTY',
          'BED': 'BED',
          'TELEPHONE': 'TELEPHONE',
          'IN/OUT': 'IN/OUT',
          'Pending': 'Pending',
          'Active': 'Active',
          'Suspended': 'Suspended',
          'No data available': 'No data available',
          'Previous page': 'Previous page',
          'Next page': 'Next page',
          'Are you sure? This action is not recoverable.': 'Are you sure? This action is not recoverable.',
          'Delete Student': 'Delete Student',
          'Student deleted successfully.': 'Student deleted successfully.',
          'Failed to delete student.': 'Failed to delete student.',
          'Export completed successfully': 'Export completed successfully',
          'Failed to export students': 'Failed to export students'
        }
      }
    })

    // Mock localStorage token
    localStorageMock.getItem.mockReturnValue('mock-token')

    // Suppress console output during tests
    console.log = vi.fn()
    console.error = vi.fn()
  })

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog
    console.error = originalConsoleError
  })

  describe('Component Initialization', () => {
    it('should render the students page correctly', () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true,
            UserIcon: true,
            ArrowDownTrayIcon: true,
            PlusIcon: true,
            CheckCircleIcon: true,
            XCircleIcon: true,
            PencilSquareIcon: true,
            TrashIcon: true,
            ChevronLeftIcon: true,
            ChevronRightIcon: true
          }
        }
      })

      expect(wrapper.find('[data-testid="students-table"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="pagination"]').exists()).toBe(true)
    })

    it('should initialize with default filter values', () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      expect(wrapper.vm.searchQuery).toBe('')
      expect(wrapper.vm.filters.status).toBe('pending')
      expect(wrapper.vm.filters.faculty).toBe('')
      expect(wrapper.vm.filters.room).toBe('')
      expect(wrapper.vm.currentPage).toBe(1)
    })
  })

  describe('Data Fetching', () => {
    beforeEach(() => {
      const mockStudentsResponse = {
        success: true,
        data: {
          data: [
            {
              id: 1,
              name: 'John Doe',
              email: 'john@test.com',
              status: 'active' as const,
              student_profile: {
                enrollment_year: 2024,
                faculty: 'engineering',
                files: ['doc1.pdf', 'doc2.pdf', 'avatar.jpg']
              },
              room: {
                number: '101'
              },
              student_bed: {
                bed_number: 'A1'
              },
              phone_numbers: ['+1234567890']
            }
          ],
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 1
        }
      }

      vi.mocked(studentService.getAll).mockResolvedValue(mockStudentsResponse)
      
      const mockRoomsResponse = {
        success: true,
        data: {
          data: [
            { 
              id: 1, 
              number: '101',
              floor: 1,
              notes: null,
              dormitory_id: 1,
              room_type_id: 1,
              is_occupied: false,
              quota: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { 
              id: 2, 
              number: '102',
              floor: 1,
              notes: null,
              dormitory_id: 1,
              room_type_id: 1,
              is_occupied: false,
              quota: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          current_page: 1,
          last_page: 1,
          per_page: 1000,
          total: 2
        }
      }
      vi.mocked(roomService.getAll).mockResolvedValue(mockRoomsResponse)
    })

    it('should fetch students on component mount', async () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(studentService.getAll).toHaveBeenCalledWith({
        page: 1,
        per_page: 10,
        status: 'pending'
      })
      expect(roomService.getAll).toHaveBeenCalledWith({ per_page: 1000 })
    })

    it('should handle missing authentication token', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.vm.error).toBe('Authentication required')
      expect(wrapper.vm.students).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      vi.mocked(studentService.getAll).mockRejectedValue(new Error('API Error'))

      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.vm.error).toBe('Failed to fetch students')
      expect(wrapper.vm.students).toEqual([])
    })
  })

  describe('Search and Filtering', () => {
    beforeEach(() => {
      vi.mocked(studentService.getAll).mockResolvedValue({
        success: true,
        data: {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0
        }
      })
    })

    it('should trigger search when search query changes', async () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick();

      // Change search query
      wrapper.vm.searchQuery = 'John';
      await wrapper.vm.$nextTick();
      
      // Wait for debounced watch
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(studentService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'John',
          page: 1
        })
      )
    })

    it('should trigger search when faculty filter changes', async () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick();

      // Change faculty filter
      wrapper.vm.filters.faculty = 'engineering';
      await wrapper.vm.$nextTick();
      
      // Wait for debounced watch
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(studentService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          faculty: 'engineering',
          page: 1
        })
      )
    })

    it('should reset to page 1 when filters change', async () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick();

      // Set current page to 3
      wrapper.vm.currentPage = 3;

      // Change search query
      wrapper.vm.searchQuery = 'test';
      await wrapper.vm.$nextTick();
      
      // Wait for debounced watch
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(wrapper.vm.currentPage).toBe(1)
    })
  })

  describe('Pagination', () => {
    beforeEach(() => {
      vi.mocked(studentService.getAll).mockResolvedValue({
        success: true,
        data: {
          data: [],
          current_page: 2,
          last_page: 5,
          per_page: 10,
          total: 50
        }
      })
    })

    it('should update page input when current page changes', async () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.vm.pageInput).toBe(2)
    })

    it('should navigate to previous page', async () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Go to previous page
      await wrapper.vm.currentPage--

      expect(studentService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1
        })
      )
    })

    it('should navigate to next page', async () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Go to next page
      await wrapper.vm.currentPage++

      expect(studentService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 3
        })
      )
    })

    it('should validate page input', async () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick();

      // Try invalid page number
      wrapper.vm.pageInput = 10;
      await wrapper.vm.goToPage();

      expect(wrapper.vm.currentPage).toBe(2) // Should reset to current page
    })
  })

  describe('Student Actions', () => {
    const mockStudent: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@test.com',
      status: 'active',
      student_profile: {
        enrollment_year: 2024,
        faculty: 'engineering',
        files: ['doc1.pdf', 'doc2.pdf', 'avatar.jpg']
      },
      room: {
        number: '101'
      },
      student_bed: {
        bed_number: 'A1'
      },
      phone_numbers: ['+1234567890']
    } as any

    beforeEach(() => {
      vi.mocked(studentService.getAll).mockResolvedValue({
        data: {
          data: [mockStudent],
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 1,
          from: 1,
          to: 1
        }
      })

      vi.mocked(roomService.getAll).mockResolvedValue({
        success: true,
        data: {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: 1000,
          total: 0
        }
      })
    })

    it('should navigate to add student form', async () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const routerPushSpy = vi.spyOn(router, 'push')

      await wrapper.vm.navigateToAddStudent()

      expect(routerPushSpy).toHaveBeenCalledWith('/student-form')
    })

    it('should navigate to edit student form', async () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const routerPushSpy = vi.spyOn(router, 'push')
      const studentStore = mockStudentStore()

      await wrapper.vm.navigateToEditStudent(1)

      expect(studentStore.setSelectedStudent).toHaveBeenCalledWith(mockStudent)
      expect(routerPushSpy).toHaveBeenCalledWith('/student-form/1')
    })

    it('should confirm and delete student', async () => {
      vi.mocked(studentService.delete).mockResolvedValue({ success: true, data: { message: 'Student deleted' } })

      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const { showSuccess } = useToast()

      await wrapper.vm.confirmDeleteStudent(1)

      expect(studentService.delete).toHaveBeenCalledWith(1)
      expect(showSuccess).toHaveBeenCalledWith('Student deleted successfully.')
    })

    it('should handle delete student error', async () => {
      vi.mocked(studentService.delete).mockRejectedValue(new Error('Delete failed'))

      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const { showError } = useToast()

      await wrapper.vm.confirmDeleteStudent(1)

      expect(showError).toHaveBeenCalledWith('Failed to delete student.')
    })
  })

  describe('Export Functionality', () => {
    beforeEach(() => {
      vi.mocked(studentService.getAll).mockResolvedValue({
        success: true,
        data: {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0
        }
      })

      vi.mocked(roomService.getAll).mockResolvedValue({
        success: true,
        data: {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: 1000,
          total: 0
        }
      })
    })

    it('should export students successfully', async () => {
      const mockBlob = new Blob(['test csv content'], { type: 'text/csv' })
      vi.mocked(studentService.export).mockResolvedValue(mockBlob)

      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const { showSuccess } = useToast()

      await wrapper.vm.exportStudents()

      expect(studentService.export).toHaveBeenCalledWith(
        expect.objectContaining({
          search: '',
          faculty: '',
          room_id: '',
          status: 'pending',
          my_dormitory_only: false,
          columns: 'name,status,enrollment_year,faculty,dormitory,bed,phone'
        })
      )
      expect(showSuccess).toHaveBeenCalledWith('Export completed successfully')
    })

    it('should handle export error', async () => {
      vi.mocked(studentService.export).mockRejectedValue(new Error('Export failed'))

      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const { showError } = useToast()

      await wrapper.vm.exportStudents()

      expect(showError).toHaveBeenCalledWith('Failed to export students')
    })
  })

  describe('Profile Picture Modal', () => {
    const mockStudentWithPicture: User = {
      id: 1,
      name: 'John Doe',
      student_profile: {
        files: ['doc1.pdf', 'doc2.pdf', 'avatar.jpg']
      }
    } as any

    const mockStudentWithoutPicture: User = {
      id: 2,
      name: 'Jane Smith',
      student_profile: {
        files: ['doc1.pdf', 'doc2.pdf']
      }
    } as any

    beforeEach(() => {
      vi.mocked(studentService.getAll).mockResolvedValue({
        success: true,
        data: {
          data: [mockStudentWithPicture, mockStudentWithoutPicture],
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 2
        }
      })

      vi.mocked(roomService.getAll).mockResolvedValue({
        success: true,
        data: {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: 1000,
          total: 0
        }
      })
    })

    it('should show student picture modal when student has picture', async () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      await wrapper.vm.showStudentPicture(mockStudentWithPicture)

      expect(wrapper.vm.selectedStudent).toEqual(mockStudentWithPicture)
      expect(wrapper.vm.showPictureModal).toBe(true)
    })

    it('should show student picture modal when student has no picture', async () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      await wrapper.vm.showStudentPicture(mockStudentWithoutPicture)

      expect(wrapper.vm.selectedStudent).toEqual(mockStudentWithoutPicture)
      expect(wrapper.vm.showPictureModal).toBe(true)
    })

    it('should get profile picture URL correctly', () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      // Test with file path
      const url1 = wrapper.vm.getProfilePictureUrl(mockStudentWithPicture)
      expect(url1).toBe('/api/avatars/avatar.jpg')

      // Test with full URL
      const studentWithFullUrl = {
        ...mockStudentWithPicture,
        student_profile: {
          files: ['doc1.pdf', 'doc2.pdf', 'https://example.com/avatar.jpg']
        }
      }
      const url2 = wrapper.vm.getProfilePictureUrl(studentWithFullUrl)
      expect(url2).toBe('https://example.com/avatar.jpg')

      // Test with no picture
      const url3 = wrapper.vm.getProfilePictureUrl(mockStudentWithoutPicture)
      expect(url3).toBeNull()
    })
  })

  describe('Status Display', () => {
    it('should return correct status class for active status', () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      const statusClass = wrapper.vm.getStatusClass('active')
      expect(statusClass).toBe('bg-green-100 text-green-800')
    })

    it('should return correct status class for pending status', () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      const statusClass = wrapper.vm.getStatusClass('pending')
      expect(statusClass).toBe('bg-yellow-100 text-yellow-800')
    })

    it('should return correct status class for suspended status', () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      const statusClass = wrapper.vm.getStatusClass('suspended')
      expect(statusClass).toBe('bg-red-100 text-red-800')
    })

    it('should return default status class for unknown status', () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      const statusClass = wrapper.vm.getStatusClass('unknown')
      expect(statusClass).toBe('bg-gray-100 text-gray-800')
    })

    it('should return correct status label', () => {
      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      expect(wrapper.vm.getStatusLabel('active')).toBe('Active')
      expect(wrapper.vm.getStatusLabel('pending')).toBe('Pending')
      expect(wrapper.vm.getStatusLabel('suspended')).toBe('Suspended')
      expect(wrapper.vm.getStatusLabel('unknown')).toBe('unknown')
    })
  })

  describe('Room Options', () => {
    beforeEach(() => {
      vi.mocked(studentService.getAll).mockResolvedValue({
        success: true,
        data: {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0
        }
      })
    })

    it('should format room options correctly', async () => {
      vi.mocked(roomService.getAll).mockResolvedValue({
        success: true,
        data: {
          data: [
            { 
              id: 1, 
              number: '101',
              floor: 1,
              notes: null,
              dormitory_id: 1,
              room_type_id: 1,
              is_occupied: false,
              quota: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { 
              id: 2, 
              number: '102',
              floor: 1,
              notes: null,
              dormitory_id: 1,
              room_type_id: 1,
              is_occupied: false,
              quota: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          current_page: 1,
          last_page: 1,
          per_page: 1000,
          total: 2
        }
      })

      wrapper = mount(Students, {
        global: {
          plugins: [i18n, router],
          stubs: {
            Navigation: true,
            CInput: true,
            CSelect: true,
            CButton: true,
            CTable: true,
            CModal: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const roomOptions = wrapper.vm.roomOptions
      expect(roomOptions).toEqual([
        { value: '', name: 'All Rooms' },
        { value: 1, name: '101' },
        { value: 2, name: '102' }
      ])
    })
  })
})
