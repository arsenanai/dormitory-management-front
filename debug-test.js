import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouterMock, injectRouterMock } from 'vue-router-mock'
import Users from './src/pages/Users.vue'
import { vi } from 'vitest'

// Mock the API service
vi.mock('./src/services/api', () => ({
  userService: {
    getAll: vi.fn().mockResolvedValue({ data: [], status: 200, statusText: 'OK', headers: {}, config: { headers: {} } }),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  dormitoryService: {
    getAll: vi.fn().mockResolvedValue({ data: [], status: 200, statusText: 'OK', headers: {}, config: { headers: {} } })
  }
}))

const router = createRouterMock()
injectRouterMock(router)

const wrapper = mount(Users, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn
      })
    ]
  }
})

console.log('Component HTML:')
console.log(wrapper.html())

console.log('All buttons:')
const buttons = wrapper.findAll('button')
buttons.forEach((button, index) => {
  console.log(`Button ${index}: "${button.text()}"`)
})
