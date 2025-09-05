import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/urlPolyfill.ts', './tests/setupMocks.ts', './tests/setup.ts'],
    exclude: ['**/e2e/**', '**/node_modules/**'],
    env: {
      VITE_API_BASE_URL: '/api'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
})
