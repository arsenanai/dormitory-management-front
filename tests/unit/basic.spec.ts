import { describe, it, expect } from 'vitest'

describe('Test Setup', () => {
  it('should be able to run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    expect('hello world').toContain('world')
  })

  it('should handle array operations', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })

  it('should handle object operations', () => {
    const obj = { name: 'John', age: 30 }
    expect(obj).toHaveProperty('name')
    expect(obj.name).toBe('John')
  })

  it('should handle async operations', async () => {
    const promise = Promise.resolve(42)
    await expect(promise).resolves.toBe(42)
  })
})
