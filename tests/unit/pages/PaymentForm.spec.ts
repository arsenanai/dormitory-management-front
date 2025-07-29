import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouterMock, injectRouterMock } from 'vue-router-mock'
import PaymentForm from '@/pages/PaymentForm.vue'
import { paymentService, userService } from '@/services/api'

// Mock the API services
vi.mock('@/services/api', () => ({
  paymentService: {
    create: vi.fn(),
    update: vi.fn(),
    getById: vi.fn()
  },
  userService: {
    getAll: vi.fn()
  }
}))

describe('PaymentForm.vue', () => {
  let wrapper: any
  let router: any

  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]

  const mockPayment = {
    id: 1,
    user_id: 1,
    amount: 500.00,
    payment_type: 'monthly_rent',
    payment_date: '2024-01-15',
    status: 'completed',
    description: 'Monthly rent payment'
  }

  beforeEach(() => {
    router = createRouterMock()
    injectRouterMock(router)
    
    wrapper = mount(PaymentForm, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ]
      }
    })
  })

  it('renders payment form correctly', () => {
    expect(wrapper.find('h1').text()).toBe('Payment Form')
    expect(wrapper.find('div').exists()).toBe(true)
  })

  it('loads users on mount', async () => {
    const mockGetAll = vi.mocked(userService.getAll)
    mockGetAll.mockResolvedValue({ data: mockUsers })

    await wrapper.vm.loadUsers()

    expect(mockGetAll).toHaveBeenCalled()
    expect(wrapper.vm.users).toEqual(mockUsers)
  })

  it('validates required fields', async () => {
    wrapper.vm.form = {
      user_id: null,
      amount: null,
      payment_type: '',
      payment_date: '',
      description: ''
    }

    const isValid = wrapper.vm.validateForm()
    expect(isValid).toBe(false)
    expect(wrapper.vm.errors.user_id).toBe('User is required')
    expect(wrapper.vm.errors.amount).toBe('Amount is required')
    expect(wrapper.vm.errors.payment_type).toBe('Payment type is required')
    expect(wrapper.vm.errors.payment_date).toBe('Payment date is required')
  })

  it('validates amount format', async () => {
    wrapper.vm.form.amount = 'invalid'
    const isValid = wrapper.vm.validateAmount()
    expect(isValid).toBe(false)
    expect(wrapper.vm.errors.amount).toBe('Amount must be a valid number')

    wrapper.vm.form.amount = -100
    const isValid2 = wrapper.vm.validateAmount()
    expect(isValid2).toBe(false)
    expect(wrapper.vm.errors.amount).toBe('Amount must be greater than 0')
  })

  it('validates payment date', async () => {
    wrapper.vm.form.payment_date = '2025-12-31'
    const isValid = wrapper.vm.validatePaymentDate()
    expect(isValid).toBe(false)
    expect(wrapper.vm.errors.payment_date).toBe('Payment date cannot be in the future')
  })

  it('submits form with valid data', async () => {
    const mockCreate = vi.mocked(paymentService.create)
    mockCreate.mockResolvedValue({ data: mockPayment })

    wrapper.vm.form = {
      user_id: 1,
      amount: 500.00,
      payment_type: 'monthly_rent',
      payment_date: '2024-01-15',
      status: 'completed',
      description: 'Monthly rent payment'
    }

    await wrapper.vm.submitForm()

    expect(mockCreate).toHaveBeenCalledWith(wrapper.vm.form)
    expect(wrapper.vm.loading).toBe(false)
  })

  it('handles form submission errors', async () => {
    const mockCreate = vi.mocked(paymentService.create)
    mockCreate.mockRejectedValue(new Error('API Error'))

    wrapper.vm.form = {
      user_id: 1,
      amount: 500.00,
      payment_type: 'monthly_rent',
      payment_date: '2024-01-15',
      status: 'completed',
      description: 'Monthly rent payment'
    }

    await wrapper.vm.submitForm()

    expect(wrapper.vm.error).toBe('Failed to create payment')
    expect(wrapper.vm.loading).toBe(false)
  })

  it('loads existing payment for editing', async () => {
    const mockGetById = vi.mocked(paymentService.getById)
    mockGetById.mockResolvedValue({ data: mockPayment })

    wrapper.vm.$route.params.id = '1'
    await wrapper.vm.loadPayment()

    expect(mockGetById).toHaveBeenCalledWith(1)
    expect(wrapper.vm.form.user_id).toBe(mockPayment.user_id)
    expect(wrapper.vm.form.amount).toBe(mockPayment.amount)
  })

  it('updates existing payment', async () => {
    const mockUpdate = vi.mocked(paymentService.update)
    mockUpdate.mockResolvedValue({ data: mockPayment })

    wrapper.vm.isEditing = true
    wrapper.vm.paymentId = 1
    wrapper.vm.form = {
      user_id: 1,
      amount: 600.00,
      payment_type: 'monthly_rent',
      payment_date: '2024-01-15',
      status: 'completed',
      description: 'Updated monthly rent payment'
    }

    await wrapper.vm.submitForm()

    expect(mockUpdate).toHaveBeenCalledWith(1, wrapper.vm.form)
  })

  it('clears form data', async () => {
    wrapper.vm.form = {
      user_id: 1,
      amount: 500.00,
      payment_type: 'monthly_rent',
      payment_date: '2024-01-15',
      status: 'completed',
      description: 'Monthly rent payment'
    }

    wrapper.vm.clearForm()

    expect(wrapper.vm.form.user_id).toBeNull()
    expect(wrapper.vm.form.amount).toBeNull()
    expect(wrapper.vm.form.payment_type).toBe('')
    expect(wrapper.vm.form.payment_date).toBe('')
    expect(wrapper.vm.form.description).toBe('')
  })

  it('formats amount correctly', () => {
    expect(wrapper.vm.formatAmount(500)).toBe('500.00')
    expect(wrapper.vm.formatAmount(1200.5)).toBe('1200.50')
    expect(wrapper.vm.formatAmount(0)).toBe('0.00')
  })

  it('calculates payment type options', () => {
    const options = wrapper.vm.paymentTypeOptions
    expect(options).toContain('monthly_rent')
    expect(options).toContain('utilities')
    expect(options).toContain('deposit')
    expect(options).toContain('damage_fee')
  })

  it('handles user selection change', async () => {
    const user = mockUsers[0]
    wrapper.vm.users = mockUsers
    wrapper.vm.form.user_id = user.id

    const selectedUser = wrapper.vm.selectedUser
    expect(selectedUser).toEqual(user)
  })

  it('validates description length', () => {
    wrapper.vm.form.description = 'a'.repeat(501)
    const isValid = wrapper.vm.validateDescription()
    expect(isValid).toBe(false)
    expect(wrapper.vm.errors.description).toBe('Description must be less than 500 characters')
  })

  it('handles cancel button click', async () => {
    const routerPush = vi.spyOn(router, 'push')
    await wrapper.vm.cancel()
    expect(routerPush).toHaveBeenCalledWith('/payments')
  })

  it('shows confirmation dialog before navigation', async () => {
    wrapper.vm.form.user_id = 1
    wrapper.vm.form.amount = 500.00
    wrapper.vm.hasUnsavedChanges = true

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    await wrapper.vm.beforeRouteLeave()
    expect(confirmSpy).toHaveBeenCalled()
  })
})
