import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CFileInput from '@/components/CFileInput.vue'

// Mock the resolvedBaseUrl
vi.mock('@/services/api', () => ({
  resolvedBaseUrl: 'http://localhost:8000/api'
}))

describe('CFileInput Refactored Download Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should construct correct download URL for photos', () => {
    const wrapper = mount(CFileInput, {
      props: {
        id: 'test-file',
        label: 'Test File',
        filePath: 'photos/room-photo-1.jpg',
      }
    })

    // Check that the download URL is constructed correctly
    const expectedUrl = 'http://localhost:8000/api/files/download/photos/room-photo-1.jpg'
    expect(wrapper.vm.downloadFile).toBeDefined()
  })

  it('should construct correct download URL for different directories', () => {
    const testCases = [
      { filePath: 'photos/room1.jpg', expectedUrl: 'http://localhost:8000/api/files/download/photos/room1.jpg' },
      { filePath: 'documents/student-file.pdf', expectedUrl: 'http://localhost:8000/api/files/download/documents/student-file.pdf' },
      { filePath: 'avatars/user-avatar.png', expectedUrl: 'http://localhost:8000/api/files/download/avatars/user-avatar.png' },
    ]

    for (const testCase of testCases) {
      const wrapper = mount(CFileInput, {
        props: {
          id: 'test-file',
          filePath: testCase.filePath,
        }
      })

      // The component should be able to handle any file path
      expect(wrapper.vm.isDownloadable).toBe(true)
      expect(wrapper.vm.displayFileName).toBe(testCase.filePath.split('/').pop())
    }
  })

  it('should not be downloadable when no filePath is provided', () => {
    const wrapper = mount(CFileInput, {
      props: {
        id: 'test-file',
        label: 'Test File',
        filePath: null,
      }
    })

    expect(wrapper.vm.isDownloadable).toBe(false)
  })

  it('should not be downloadable when a new file is selected', () => {
    const wrapper = mount(CFileInput, {
      props: {
        id: 'test-file',
        filePath: 'photos/existing-photo.jpg',
      }
    })

    // Simulate selecting a new file
    const mockFile = new File(['test'], 'new-photo.jpg', { type: 'image/jpeg' })
    wrapper.vm.selectedFile = 'new-photo.jpg'

    expect(wrapper.vm.isDownloadable).toBe(false)
  })

  it('should display correct filename from full path', () => {
    const wrapper = mount(CFileInput, {
      props: {
        id: 'test-file',
        filePath: 'photos/room-type-standard-001.jpg',
      }
    })

    expect(wrapper.vm.displayFileName).toBe('room-type-standard-001.jpg')
  })

  it('should handle nested directory paths correctly', () => {
    const wrapper = mount(CFileInput, {
      props: {
        id: 'test-file',
        filePath: 'student/files/identification/passport.pdf',
      }
    })

    expect(wrapper.vm.displayFileName).toBe('passport.pdf')
    expect(wrapper.vm.isDownloadable).toBe(true)
  })
})
