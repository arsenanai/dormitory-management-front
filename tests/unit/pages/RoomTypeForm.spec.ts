import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouterMock, injectRouterMock } from 'vue-router-mock'
import RoomTypeForm from '@/pages/RoomTypeForm.vue'
import { roomTypeService, dormitoryService } from '@/services/api';
import { useSettingsStore } from '@/stores/settings';
import i18n from '@/i18n';

// Mock the API services
vi.mock('@/services/api', () => ({
  roomTypeService: {
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock useToast composable
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

vi.mock('@/stores/settings', () => ({
  useSettingsStore: () => ({
    generalSettings: {
      currency_symbol: '$',
    },
    fetchAllSettings: vi.fn(),
  }),
}));

describe('RoomTypeForm.vue', () => {
  let wrapper: any
  let router: any

  beforeEach(() => {
    router = createRouterMock()
    injectRouterMock(router)

    wrapper = mount(RoomTypeForm, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
          router,
          i18n,
        ],
        stubs: {
          'Navigation': { template: '<div><slot /></div>' },
          'CInput': { template: '<input />' },
          'CTextarea': { template: '<textarea />' },
          'CButton': { template: '<button><slot /></button>' },
          'CFileInput': { template: '<input type="file" />' },
          'TrashIcon': { template: '<i></i>' },
          'PlusIcon': { template: '<i></i>' },
        }
      },
    })
  })

  it('renders add form correctly', () => {
    expect(wrapper.text()).toContain('Add Room Type')
  })

  it('renders edit form correctly', async () => {
    const mockRoomType = {
      id: 1,
      name: 'Test Room Type',
      description: 'Test Description',
      capacity: 2,
      daily_rate: 50,
      semester_rate: 1000,
      photos: [],
    }
    vi.mocked(roomTypeService.getById).mockResolvedValue({ data: mockRoomType } as any)
    
    await router.push('/room-type-form/1')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Edit Room Type')
    expect(wrapper.vm.form.name).toBe('Test Room Type')
  })

  it('submits new room type data', async () => {
    wrapper.vm.form.name = 'New Room Type'
    wrapper.vm.form.capacity = 3
    wrapper.vm.form.daily_rate = 75
    wrapper.vm.form.semester_rate = 1500
    wrapper.vm.photoFields = [new File([''], 'photo.jpg')]
    
    const mockCreate = vi.mocked(roomTypeService.create).mockResolvedValue({} as any)
    
    await wrapper.vm.handleSubmit()
    
    expect(mockCreate).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith('/room-types')
  })
  
  it('submits updated room type data', async () => {
    await router.push('/room-type-form/1')
    await wrapper.vm.$nextTick()

    wrapper.vm.form.name = 'Updated Room Type'
    wrapper.vm.photoFields = [new File([''], 'photo.jpg')]

    const mockUpdate = vi.mocked(roomTypeService.update).mockResolvedValue({} as any)
    
    await wrapper.vm.handleSubmit()
    
    expect(mockUpdate).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith('/room-types')
  })
})
