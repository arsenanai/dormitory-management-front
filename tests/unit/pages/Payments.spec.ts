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
      payment_type: 'monthly_rent',
      payment_date: '2024-01-15',
      status: 'completed',
      description: 'Monthly rent payment',
      user: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      }
    },
    {
      id: 2,
      user_id: 2,
      amount: 150.00,
      payment_type: 'utilities',
      payment_date: '2024-01-16',
      status: 'pending',
      description: 'Utility bill payment',
      user: {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com'
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
    expect(wrapper.find('h1').text()).toBe('Payments')
    expect(wrapper.find('[data-testid="add-payment-button"]').text()).toContain('Add Payment')
  })

  it('loads payments on mount', async () => {
    const mockGetAll = vi.mocked(paymentService.getAll)
    mockGetAll.mockResolvedValue(createAxiosResponse({ data: mockPayments, total: mockPayments.length }))

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
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()

    // Check for skeleton loading instead of loading-text
    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
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
    mockGetAll.mockResolvedValue(createAxiosResponse({ data: [mockPayments[0]], total: 1 }))

    // Mock localStorage to have a token
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue('mock-token')
    }
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

    wrapper.vm.statusFilter = 'completed'
    await wrapper.vm.loadPayments()

    expect(mockGetAll).toHaveBeenCalledWith({ status: 'completed', page: 1, per_page: 10 })
  })

  it('filters payments by type', async () => {
    const mockGetAll = vi.mocked(paymentService.getAll)
    mockGetAll.mockResolvedValue(createAxiosResponse({ data: [mockPayments[0]], total: 1 }))

    // Mock localStorage to have a token
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue('mock-token')
    }
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

    wrapper.vm.typeFilter = 'monthly_rent'
    await wrapper.vm.loadPayments()

    expect(mockGetAll).toHaveBeenCalledWith({ type: 'monthly_rent', page: 1, per_page: 10 })
  })

  it('creates new payment', async () => {
    const mockCreate = vi.mocked(paymentService.create)
    const newPaymentData = {
      user_id: 1,
      amount: 300.00,
      semester: 'fall',
      academic_year: '2024'
    }
    mockCreate.mockResolvedValue(createAxiosResponse({ id: 3, ...newPaymentData }))

    await wrapper.vm.createPayment(newPaymentData)

    // The component transforms the data before sending to API
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 1,
      amount: 300.00,
      semester: 'fall',
      contract_number: expect.any(String),
      contract_date: expect.any(String),
      payment_date: expect.any(String),
      payment_method: 'bank_transfer',
      year: expect.any(Number),
      semester_type: 'fall'
    }))
  })

  it('updates existing payment', async () => {
    const mockUpdate = vi.mocked(paymentService.update)
    mockUpdate.mockResolvedValue(createAxiosResponse({ ...mockPayments[0], amount: 600.00 }))

    const updatedPayment = { amount: 600.00, semester: 'spring' }

    await wrapper.vm.updatePayment(1, updatedPayment)

    // The component only sends specific fields for updates
    expect(mockUpdate).toHaveBeenCalledWith(1, expect.objectContaining({
      amount: 600.00,
      semester: 'spring'
    }))
  })

  it('deletes payment', async () => {
    const mockDelete = vi.mocked(paymentService.delete)
    mockDelete.mockResolvedValue(createAxiosResponse({ message: 'Payment deleted' }))

    // Set up the payment to delete
    wrapper.vm.paymentToDelete = 1
    await wrapper.vm.deletePayment()

    expect(mockDelete).toHaveBeenCalledWith(1)
  })

  it('exports payments', async () => {
    const mockExport = vi.mocked(paymentService.export)
    const mockBlob = new Blob(['payment data'], { type: 'text/csv' })
    mockExport.mockResolvedValue(createAxiosResponse(mockBlob))

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
    mockGetAll.mockResolvedValue(createAxiosResponse({ data: manyPayments, total: 25 }))

    await wrapper.vm.loadPayments()

    // With server-side pagination, paginatedPayments returns all payments from API
    const paginatedPayments = wrapper.vm.paginatedPayments
    expect(paginatedPayments).toHaveLength(25)
    expect(paginatedPayments[0].id).toBe(1)
  })

  it('calculates total amount correctly', async () => {
    // Use fresh copy of mock data to avoid mutations from other tests
    const freshMockPayments = [
      {
        id: 1,
        user_id: 1,
        amount: 500.00,
        payment_type: 'monthly_rent',
        payment_date: '2024-01-15',
        status: 'completed',
        description: 'Monthly rent payment',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      {
        id: 2,
        user_id: 2,
        amount: 150.00,
        payment_type: 'utilities',
        payment_date: '2024-01-16',
        status: 'pending',
        description: 'Utility bill payment',
        user: {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      }
    ]

    // Reset filters to ensure no filtering
    wrapper.vm.searchTerm = ''
    wrapper.vm.statusFilter = ''
    wrapper.vm.typeFilter = ''
    wrapper.vm.payments = freshMockPayments
    await wrapper.vm.$nextTick()

    const total = wrapper.vm.totalAmount
    expect(total).toBe(650.00)
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
    const mockCreate = vi.mocked(paymentService.create)
    const formData = {
      user_id: 1,
      amount: 300.00,
      semester: 'fall',
      academic_year: '2024'
    }
    mockCreate.mockResolvedValue(createAxiosResponse({ id: 3, ...formData }))

    await wrapper.vm.handleFormSubmit(formData)

    // The component transforms the form data before sending to API
    // It calls createPayment which transforms the data
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 1,
      amount: 300.00,
      semester: 'fall', // The createPayment method uses the semester directly, not combined
      contract_number: expect.any(String),
      contract_date: expect.any(String),
      payment_date: expect.any(String),
      payment_method: 'bank_transfer',
      year: expect.any(Number),
      semester_type: 'fall'
    }))
    expect(wrapper.vm.showForm).toBe(false)
  })
})
