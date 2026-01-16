import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouterMock, injectRouterMock } from 'vue-router-mock'
import { createI18n } from 'vue-i18n'
import RoomTypeForm from '@/pages/RoomTypeForm.vue'
import { roomTypeService } from '@/services/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  roomTypeService: {
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  resolvedBaseUrl: 'http://localhost:8000/api'
}))

// Mock i18n
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'Name is required': 'Name is required',
      'Capacity must be at least 1': 'Capacity must be at least 1',
      'Daily rate must be non-negative': 'Daily rate must be non-negative',
      'Semester rate must be non-negative': 'Semester rate must be non-negative',
      'Failed to save room type': 'Failed to save room type',
      'Room Plan Photo': 'Room Plan Photo',
      'Upload a room plan photo to help students understand the room layout': 'Upload a room plan photo to help students understand the room layout',
      'Current Room Plan Photo': 'Current Room Plan Photo'
    }
  }
})

// Mock router
const router = createRouterMock()
injectRouterMock(router)

const mockPush = vi.fn()
router.push = mockPush

describe('RoomTypeForm File Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('correctly updates minimap from string to File object when new file is selected', async () => {
    const mockUpdate = vi.mocked(roomTypeService.update)
    mockUpdate.mockResolvedValue({
      data: {
        id: 1,
        name: 'Updated Room',
        description: 'Updated description',
        minimap: 'minimaps/new-upload.jpg',
        capacity: 3,
        daily_rate: 200,
        semester_rate: 600
      }
    })

    // Mock existing room type with minimap
    const mockRoomType = {
      id: 1,
      name: 'Test Room',
      description: 'Test description',
      minimap: 'minimaps/existing-plan.jpg',
      capacity: 2,
      daily_rate: 150,
      semester_rate: 800
    }

    vi.mocked(roomTypeService.getById).mockResolvedValue({
      data: mockRoomType
    })

    router.setParams({ id: '1' })

    const wrapper = mount(RoomTypeForm, {
      global: { plugins: [router, i18n] }
    })

    // Load existing room type
    await wrapper.vm.loadRoomType()
    await wrapper.vm.$nextTick()

    // Verify initial state - should be string
    expect(wrapper.vm.form.minimap).toBe('minimaps/existing-plan.jpg')
    expect(typeof wrapper.vm.form.minimap).toBe('string')

    // Simulate file selection - create a mock file
    const mockFile = new File(['test content'], 'student_3_doc_1-3.png', { type: 'image/png' })
    
    // Find the file input component and trigger file selection
    const fileInput = wrapper.findComponent({ name: 'CFileInput' })
    
    // Simulate the file selection by directly updating the form data
    // This simulates what should happen when v-model updates
    await wrapper.vm.$nextTick()
    wrapper.vm.form.minimap = mockFile
    await wrapper.vm.$nextTick()

    // Verify the form now contains the File object
    expect(wrapper.vm.form.minimap).toBe(mockFile)
    expect(wrapper.vm.form.minimap instanceof File).toBe(true)

    // Submit the form
    await wrapper.vm.handleSubmit()

    // Verify the API was called with FormData containing the file
    expect(mockUpdate).toHaveBeenCalledWith(1, expect.any(FormData))
    
    const formData = mockUpdate.mock.calls[0][1] as FormData
    
    // Verify FormData contains the File object, not the string
    expect(formData.get('minimap')).toBe(mockFile)
    expect(formData.get('minimap') instanceof File).toBe(true)
    expect(formData.get('minimap').name).toBe('student_3_doc_1-3.png')
  })

  it('preserves existing minimap string when no new file is selected', async () => {
    const mockUpdate = vi.mocked(roomTypeService.update)
    mockUpdate.mockResolvedValue({
      data: {
        id: 1,
        name: 'Updated Room',
        description: 'Updated description',
        minimap: 'minimaps/existing-plan.jpg',
        capacity: 3,
        daily_rate: 200,
        semester_rate: 600
      }
    })

    // Mock existing room type with minimap
    const mockRoomType = {
      id: 1,
      name: 'Test Room',
      description: 'Test description',
      minimap: 'minimaps/existing-plan.jpg',
      capacity: 2,
      daily_rate: 150,
      semester_rate: 800
    }

    vi.mocked(roomTypeService.getById).mockResolvedValue({
      data: mockRoomType
    })

    router.setParams({ id: '1' })

    const wrapper = mount(RoomTypeForm, {
      global: { plugins: [router, i18n] }
    })

    // Load existing room type
    await wrapper.vm.loadRoomType()
    await wrapper.vm.$nextTick()

    // Verify initial state - should be string
    expect(wrapper.vm.form.minimap).toBe('minimaps/existing-plan.jpg')
    expect(typeof wrapper.vm.form.minimap).toBe('string')

    // Update other fields but don't change minimap
    wrapper.vm.form.name = 'Updated Room'
    wrapper.vm.form.capacity = 3
    await wrapper.vm.$nextTick()

    // Submit the form
    await wrapper.vm.handleSubmit()

    // Verify the API was called with FormData containing the string
    expect(mockUpdate).toHaveBeenCalledWith(1, expect.any(FormData))
    
    const formData = mockUpdate.mock.calls[0][1] as FormData
    
    // Verify FormData contains the string, not a File object
    expect(formData.get('minimap')).toBe('minimaps/existing-plan.jpg')
    expect(typeof formData.get('minimap')).toBe('string')
  })
})
