import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouterMock, injectRouterMock } from 'vue-router-mock'
import RoomTypeBasicForm from '@/pages/RoomTypeBasicForm.vue'
import { roomTypeService } from '@/services/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  roomTypeService: {
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  }
}))

// Mock Navigation component
vi.mock('@/components/CNavigation.vue', () => ({
  default: {
    name: 'Navigation',
    template: '<div class="navigation"><slot></slot></div>',
    props: ['title']
  }
}))

describe('RoomTypeBasicForm.vue', () => {
  let wrapper: any
  let router: any

  const mockRoomType = {
    id: 1,
    name: 'standard',
    description: 'Standard room with amenities',
    capacity: 2,
    price: 150.00
  }

  beforeEach(() => {
    router = createRouterMock()
    injectRouterMock(router)
    
    vi.mocked(roomTypeService.get).mockResolvedValue({ data: mockRoomType })
    vi.mocked(roomTypeService.create).mockResolvedValue({ data: mockRoomType })
    vi.mocked(roomTypeService.update).mockResolvedValue({ data: mockRoomType })
    
    wrapper = mount(RoomTypeBasicForm, {
      global: {
        mocks: {
          $route: { params: {} }
        }
      }
    })
  })

  it('renders form correctly', () => {
    expect(wrapper.findComponent({ name: 'Navigation' }).exists()).toBe(true)
    expect(wrapper.find('select[name="room-type-name"]').exists()).toBe(true)
    expect(wrapper.find('input[name="room-type-capacity"]').exists()).toBe(true)
    expect(wrapper.find('input[name="room-type-price"]').exists()).toBe(true)
  })

  it('shows correct title for new room type', () => {
    expect(wrapper.text()).toContain('Add Room Type')
  })

  it('shows correct title for editing room type', async () => {
    wrapper = mount(RoomTypeBasicForm, {
      global: {
        mocks: {
          $route: { params: { id: '1' } }
        }
      }
    })
    
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Edit Room Type')
  })

  it('has correct room type options', () => {
    const select = wrapper.find('select[name="room-type-name"]')
    const options = select.findAll('option')
    
    expect(options).toHaveLength(3)
    expect(options[0].text()).toBe('Select room type')
    expect(options[1].text()).toBe('Standard')
    expect(options[2].text()).toBe('Lux')
    expect(options[1].attributes('value')).toBe('standard')
    expect(options[2].attributes('value')).toBe('lux')
  })

  it('auto-sets capacity and price for standard room type', async () => {
    const nameSelect = wrapper.find('select[name="room-type-name"]')
    await nameSelect.setValue('standard')
    
    expect(wrapper.vm.form.capacity).toBe(2)
    expect(wrapper.vm.form.price).toBe(150.00)
  })

  it('auto-sets capacity and price for lux room type', async () => {
    const nameSelect = wrapper.find('select[name="room-type-name"]')
    await nameSelect.setValue('lux')
    
    expect(wrapper.vm.form.capacity).toBe(1)
    expect(wrapper.vm.form.price).toBe(300.00)
  })

  it('validates required fields', async () => {
    const submitButton = wrapper.find('button[type="submit"]')
    await submitButton.trigger('click')
    
    expect(wrapper.vm.errors.name).toBe('Name is required')
    expect(wrapper.vm.errors.capacity).toBe('Capacity must be at least 1')
    expect(wrapper.vm.errors.price).toBe('Price must be non-negative')
  })

  it('creates new room type successfully', async () => {
    const mockCreate = vi.mocked(roomTypeService.create)
    mockCreate.mockResolvedValue({ data: mockRoomType })

    // Fill form
    await wrapper.find('select[name="room-type-name"]').setValue('standard')
    await wrapper.find('input[name="room-type-capacity"]').setValue(2)
    await wrapper.find('input[name="room-type-price"]').setValue(150.00)
    
    // Submit form
    await wrapper.find('form[name="room-type-form"]').trigger('submit')
    
    expect(mockCreate).toHaveBeenCalledWith({
      name: 'standard',
      description: '',
      capacity: 2,
      price: 150.00
    })
  })

  it('updates existing room type successfully', async () => {
    wrapper = mount(RoomTypeBasicForm, {
      global: {
        mocks: {
          $route: { params: { id: '1' } }
        }
      }
    })
    
    await wrapper.vm.$nextTick()
    
    const mockUpdate = vi.mocked(roomTypeService.update)
    mockUpdate.mockResolvedValue({ data: mockRoomType })

    // Fill form
    await wrapper.find('select[name="room-type-name"]').setValue('lux')
    await wrapper.find('input[name="room-type-capacity"]').setValue(1)
    await wrapper.find('input[name="room-type-price"]').setValue(300.00)
    
    // Submit form
    await wrapper.find('form[name="room-type-form"]').trigger('submit')
    
    expect(mockUpdate).toHaveBeenCalledWith(1, {
      name: 'lux',
      description: '',
      capacity: 1,
      price: 300.00
    })
  })

  it('loads existing room type data when editing', async () => {
    wrapper = mount(RoomTypeBasicForm, {
      global: {
        mocks: {
          $route: { params: { id: '1' } }
        }
      }
    })
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.form.name).toBe('standard')
    expect(wrapper.vm.form.capacity).toBe(2)
    expect(wrapper.vm.form.price).toBe(150.00)
  })

  it('handles API errors gracefully', async () => {
    const mockCreate = vi.mocked(roomTypeService.create)
    mockCreate.mockRejectedValue({ 
      response: { 
        data: { 
          errors: { name: ['Name is invalid'] } 
        } 
      } 
    })

    // Fill form
    await wrapper.find('select[name="room-type-name"]').setValue('standard')
    await wrapper.find('input[name="room-type-capacity"]').setValue(2)
    await wrapper.find('input[name="room-type-price"]').setValue(150.00)
    
    // Submit form
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.vm.errors.name).toBe('Name is invalid')
  })

  it('navigates back on cancel', async () => {
    const cancelButton = wrapper.find('button[type="button"]')
    await cancelButton.trigger('click')
    
    expect(router.push).toHaveBeenCalledWith('/room-types')
  })

  it('has correct input constraints', () => {
    const capacityInput = wrapper.find('input[name="room-type-capacity"]')
    const priceInput = wrapper.find('input[name="room-type-price"]')
    
    expect(capacityInput.attributes('min')).toBe('1')
    expect(capacityInput.attributes('max')).toBe('4')
    expect(priceInput.attributes('min')).toBe('0')
    expect(priceInput.attributes('step')).toBe('0.01')
  })
})
