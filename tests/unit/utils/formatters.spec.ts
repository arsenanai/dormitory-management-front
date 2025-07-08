import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatCurrency,
  formatPhone,
  validateEmail,
  calculateAge,
  generateId,
  capitalizeFirst,
  truncateText,
  isValidDate,
  getFileExtension,
  formatFileSize,
  deepClone,
  sortBy,
  debounce,
  throttle
} from '@/utils/formatters'

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly in MM/DD/YYYY format', () => {
      expect(formatDate('2024-01-15')).toBe('01/15/2024')
      expect(formatDate('2024-12-25')).toBe('12/25/2024')
    })

    it('formats date correctly in DD/MM/YYYY format', () => {
      expect(formatDate('2024-01-15', 'DD/MM/YYYY')).toBe('15/01/2024')
      expect(formatDate('2024-12-25', 'DD/MM/YYYY')).toBe('25/12/2024')
    })

    it('formats date correctly in YYYY-MM-DD format', () => {
      expect(formatDate('2024-01-15', 'YYYY-MM-DD')).toBe('2024-01-15')
      expect(formatDate('2024-12-25', 'YYYY-MM-DD')).toBe('2024-12-25')
    })

    it('handles invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('')
      expect(formatDate('')).toBe('')
    })
  })

  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('handles non-numeric values', () => {
      expect(formatCurrency(NaN)).toBe('$0.00')
      expect(formatCurrency('abc' as any)).toBe('$0.00')
    })
  })

  describe('formatPhone', () => {
    it('formats 10-digit phone numbers', () => {
      expect(formatPhone('1234567890')).toBe('(123) 456-7890')
      expect(formatPhone('555-123-4567')).toBe('(555) 123-4567')
    })

    it('formats 11-digit phone numbers with country code', () => {
      expect(formatPhone('11234567890')).toBe('+1 (123) 456-7890')
      expect(formatPhone('+11234567890')).toBe('+1 (123) 456-7890')
    })

    it('handles invalid phone numbers', () => {
      expect(formatPhone('123')).toBe('123')
      expect(formatPhone('')).toBe('')
    })
  })

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.org')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test..test@example.com')).toBe(false)
    })
  })

  describe('calculateAge', () => {
    it('calculates age correctly', () => {
      const birthDate = new Date()
      birthDate.setFullYear(birthDate.getFullYear() - 25)
      expect(calculateAge(birthDate)).toBe(25)
    })

    it('handles future birth dates', () => {
      const futureBirthDate = new Date()
      futureBirthDate.setFullYear(futureBirthDate.getFullYear() + 1)
      expect(calculateAge(futureBirthDate)).toBe(-1)
    })

    it('handles invalid dates', () => {
      expect(calculateAge('')).toBe(0)
      expect(calculateAge('invalid-date')).toBe(0)
    })
  })

  describe('generateId', () => {
    it('generates unique ids', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^[a-z0-9]{9}$/)
    })
  })

  describe('capitalizeFirst', () => {
    it('capitalizes first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello')
      expect(capitalizeFirst('HELLO')).toBe('Hello')
      expect(capitalizeFirst('hELLO')).toBe('Hello')
    })

    it('handles empty strings', () => {
      expect(capitalizeFirst('')).toBe('')
    })
  })

  describe('truncateText', () => {
    it('truncates text correctly', () => {
      expect(truncateText('Hello world', 5)).toBe('Hello...')
      expect(truncateText('Hello', 10)).toBe('Hello')
      expect(truncateText('', 5)).toBe('')
    })
  })

  describe('isValidDate', () => {
    it('validates correct dates', () => {
      expect(isValidDate('2024-01-15')).toBe(true)
      expect(isValidDate(new Date())).toBe(true)
    })

    it('rejects invalid dates', () => {
      expect(isValidDate('invalid-date')).toBe(false)
      expect(isValidDate('')).toBe(false)
    })
  })

  describe('getFileExtension', () => {
    it('gets file extensions correctly', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf')
      expect(getFileExtension('image.JPG')).toBe('jpg')
      expect(getFileExtension('archive.tar.gz')).toBe('gz')
    })

    it('handles files without extensions', () => {
      expect(getFileExtension('filename')).toBe('')
      expect(getFileExtension('')).toBe('')
    })
  })

  describe('formatFileSize', () => {
    it('formats file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })
  })

  describe('deepClone', () => {
    it('clones objects deeply', () => {
      const original = { a: 1, b: { c: 2 } }
      const cloned = deepClone(original)
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.b).not.toBe(original.b)
    })

    it('clones arrays deeply', () => {
      const original = [1, { a: 2 }, [3, 4]]
      const cloned = deepClone(original)
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned[1]).not.toBe(original[1])
    })

    it('handles primitive values', () => {
      expect(deepClone(42)).toBe(42)
      expect(deepClone('hello')).toBe('hello')
      expect(deepClone(null)).toBe(null)
    })
  })

  describe('sortBy', () => {
    const testArray = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
      { name: 'Bob', age: 35 }
    ]

    it('sorts by string field ascending', () => {
      const sorted = sortBy(testArray, 'name', 'asc')
      expect(sorted[0].name).toBe('Bob')
      expect(sorted[1].name).toBe('Jane')
      expect(sorted[2].name).toBe('John')
    })

    it('sorts by number field descending', () => {
      const sorted = sortBy(testArray, 'age', 'desc')
      expect(sorted[0].age).toBe(35)
      expect(sorted[1].age).toBe(30)
      expect(sorted[2].age).toBe(25)
    })

    it('does not mutate original array', () => {
      const original = [...testArray]
      sortBy(testArray, 'name', 'asc')
      expect(testArray).toEqual(original)
    })
  })
})
