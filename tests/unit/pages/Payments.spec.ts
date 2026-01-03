import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouterMock, injectRouterMock } from 'vue-router-mock'
import Payments from '@/pages/Payments.vue'
import { paymentService } from '@/services/api'
import type { AxiosResponse } from 'axios'

// Helper function to create proper Axios response mock
const createAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any
})

// Mock the API service
vi.mock('@/services/api', () => ({
  paymentService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    export: vi.fn()
  }
}))

describe('Payments.vue', () => {
  let wrapper: any
  let router: any

  const mockPayments = [
    {
      id: 1,
      user_id: 1,
      amount: 500.00,
      date_from: '2024-01-01',
      date_to: '2024-01-31',
      deal_number: 'D001',
      deal_date: '2024-01-01',
      payment_check: null,
      status: 'completed',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      user: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone_numbers: ['+1234567890']
      }
    },
    {
      id: 2,
      user_id: 2,
      amount: 300.00,
      date_from: '2024-02-01',
      date_to: '2024-02-28',
      deal_number: 'D002',
      deal_date: '2024-02-01',
      payment_check: null,
      status: 'pending',
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-02-01T10:00:00Z',
      user: {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone_numbers: ['+0987654321']
      }
    }
  ]

  beforeEach(() => {
    router = createRouterMock()
    injectRouterMock(router)
    
    wrapper = mount(Payments, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ],
        stubs: {
          CNavigation: {
            template: '<div><slot /></div>'
          },
          CInput: {
            props: ['id', 'label', 'modelValue', 'placeholder', 'class'],
            template: '<input :id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
          },
          CSelect: {
            props: ['id', 'label', 'modelValue', 'options', 'placeholder', 'class'],
            template: '<select :id="id" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="option in options" :key="option.value" :value="option.value">{{ option.name }}</option></select>'
          },
          CButton: {
            props: ['variant', 'size', 'disabled'],
            template: '<button :disabled="disabled"><slot /></button>'
          },
          CTable: {
            template: '<table><slot /></table>'
          },
          CTableHead: {
            template: '<thead><slot /></thead>'
          },
          CTableHeadCell: {
            template: '<th><slot /></th>'
          },
          CTableBody: {
            template: '<tbody><slot /></tbody>'
          },
          CTableRow: {
            template: '<tr><slot /></tr>'
          },
          CTableCell: {
            template: '<td><slot /></td>'
          }
        }
      }
    })
  })

  afterEach(() => {
    // Reset component state after each test
    if (wrapper) {
      wrapper.vm.payments = []
      wrapper.vm.searchTerm = ''
      wrapper.vm.statusFilter = ''
      wrapper.vm.typeFilter = ''
      wrapper.vm.currentPage = 1
      wrapper.vm.loading = false
      wrapper.vm.error = null
      wrapper.vm.showForm = false
    }
  })

  it('renders payment page correctly', () => {
    // Check if the component renders
    expect(wrapper.exists()).toBe(true)
    // Check if the title is rendered (using Navigation component)
    expect(wrapper.text()).toContain('Payment Management')
  })

  it('loads payments on mount', async () => {
    const mockGetAll = vi.mocked(paymentService.getAll)
    mockGetAll.mockResolvedValue({ data: { data: mockPayments, meta: { total: mockPayments.length } }, success: true })

    // Mock localStorage to have a token
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue('mock-token')
    }
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

    await wrapper.vm.loadPayments()

    expect(mockGetAll).toHaveBeenCalled()
    expect(wrapper.vm.payments).toEqual(mockPayments)
  })

  it('handles loading state', async () => {
    const mockGetAll = vi.mocked(paymentService.getAll)
    // Mock a delayed response
    mockGetAll.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ data: { data: mockPayments, meta: { total: 2 } }, success: true }), 100)
    }))

    // Mock localStorage to have a token
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue('mock-token')
    }
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

    const loadPromise = wrapper.vm.loadPayments()
    
    // Should be loading
    expect(wrapper.vm.loading).toBe(true)
    
    await loadPromise
    
    // Should be done loading
    expect(wrapper.vm.loading).toBe(false)
  })

  it('handles error state', async () => {
    wrapper.vm.error = 'Failed to load payments'
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-message').text()).toBe('Failed to load payments')
  })

  it('filters payments by search term', async () => {
    const mockGetAll = vi.mocked(paymentService.getAll)
    mockGetAll.mockResolvedValue(createAxiosResponse({ data: [mockPayments[0]], total: 1 }))

    // Mock localStorage to have a token
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue('mock-token')
    }
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

    wrapper.vm.searchTerm = 'John'
    await wrapper.vm.loadPayments()

    expect(mockGetAll).toHaveBeenCalledWith({ search: 'John', page: 1, per_page: 10 })
  })

  it('filters payments by status', async () => {
    const mockGetAll = vi.mocked(paymentService.getAll)
    mockGetAll.mockResolvedValue(createAxiosResponse({ data: [mockPayments[0]], meta: { total: 1 } }))

    // Mock localStorage to have a token
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue('mock-token')
    }
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

    wrapper.vm.selectedRole = 'student'
    await wrapper.vm.loadPayments()

    expect(mockGetAll).toHaveBeenCalledWith({ role: 'student', page: 1, per_page: 10 })
  })

  it('filters payments by search term', async () => {
    const mockGetAll = vi.mocked(paymentService.getAll)
    mockGetAll.mockResolvedValue(createAxiosResponse({ data: [mockPayments[0]], meta: { total: 1 } }))

    // Mock localStorage to have a token
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue('mock-token')
    }
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

    wrapper.vm.searchTerm = 'John'
    await wrapper.vm.loadPayments()

    expect(mockGetAll).toHaveBeenCalledWith({ search: 'John', page: 1, per_page: 10 })
  })

  it('shows payment form modal', async () => {
    await wrapper.vm.showPaymentForm()
    expect(wrapper.vm.showForm).toBe(true)
  })

  it('closes payment form modal', async () => {
    wrapper.vm.showForm = true
    await wrapper.vm.closePaymentForm()
    expect(wrapper.vm.showForm).toBe(false)
  })

  it('handles form submission', async () => {
    const mockGetAll = vi.mocked(paymentService.getAll)
    mockGetAll.mockResolvedValue(createAxiosResponse({ data: [], meta: { total: 0 } }))

    await wrapper.vm.handleFormSubmission()
    
    // Should reload payments and close form
    expect(mockGetAll).toHaveBeenCalled()
    expect(wrapper.vm.showForm).toBe(false)
  })

  it('deletes payment', async () => {
    const mockDelete = vi.mocked(paymentService.delete)
    mockDelete.mockResolvedValue({ data: { message: 'Payment deleted' }, success: true })

    // Set up the payment to delete
    wrapper.vm.paymentToDelete = 1
    await wrapper.vm.deletePayment()

    expect(mockDelete).toHaveBeenCalledWith(1)
  })

  it('exports payments', async () => {
    const mockExport = vi.mocked(paymentService.export)
    const mockBlob = new Blob(['payment data'], { type: 'text/csv' })
    mockExport.mockResolvedValue(mockBlob)

    // Mock URL.createObjectURL and revokeObjectURL
    const mockCreateObjectURL = vi.fn().mockReturnValue('mock-url')
    const mockRevokeObjectURL = vi.fn()
    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL
      }
    })

    await wrapper.vm.exportPayments()

    expect(mockExport).toHaveBeenCalled()
    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob)
  })

  it('handles API errors gracefully', async () => {
    // Mock localStorage to have a token so it doesn't show "Authentication required"
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue('mock-token')
    }
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })
    
    const mockGetAll = vi.mocked(paymentService.getAll)
    mockGetAll.mockRejectedValue(new Error('API Error'))

    await wrapper.vm.loadPayments()

    expect(wrapper.vm.error).toBe('Failed to load payments')
    expect(wrapper.vm.loading).toBe(false)
  })

  it('paginates payments correctly', async () => {
    const manyPayments = Array.from({ length: 25 }, (_, i) => ({
      ...mockPayments[0],
      id: i + 1,
      user: { ...mockPayments[0].user, id: i + 1 }
    }))

    const mockGetAll = vi.mocked(paymentService.getAll)
    mockGetAll.mockResolvedValue({ data: { data: manyPayments, meta: { total: 25 } }, success: true })

    await wrapper.vm.loadPayments()

    // With server-side pagination, paginatedPayments returns all payments from API
    const paginatedPayments = wrapper.vm.paginatedPayments
    expect(paginatedPayments).toHaveLength(25)
    expect(paginatedPayments[0].id).toBe(1)
  })

  it('calculates total correctly using computed property', async () => {
    // Test that total is computed from the API response
    const mockGetAll = vi.mocked(paymentService.getAll)
    mockGetAll.mockResolvedValue({ data: { data: mockPayments, meta: { total: 2 } }, success: true })

    await wrapper.vm.loadPayments()

    expect(wrapper.vm.total).toBe(2)
  })
})
