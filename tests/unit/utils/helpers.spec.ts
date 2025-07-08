import { describe, it, expect, vi } from 'vitest';
import { 
  formatDateHelper as formatDate,
  formatAmount,
  filterArrayBySearch,
  paginateArray,
  calculateTotalPages,
  downloadBlob,
  validateEmailHelper as validateEmail,
  debounceHelper as debounce
} from '@/utils/helpers';

// Utility functions that might be used across components
describe('Component Utilities', () => {
  describe('formatDate', () => {
    it('should format valid date strings correctly', () => {
      const result = formatDate('2024-01-01T00:00:00Z');
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should return dash for empty or invalid dates', () => {
      expect(formatDate('')).toBe('-');
      expect(formatDate('invalid-date')).toBe('-');
    });

    it('should handle null and undefined', () => {
      expect(formatDate(null as any)).toBe('-');
      expect(formatDate(undefined as any)).toBe('-');
    });
  });

  describe('formatAmount', () => {
    it('should format numeric amounts with T suffix', () => {
      expect(formatAmount(1000)).toBe('1000T');
      expect(formatAmount(0)).toBe('0');
    });

    it('should return string amounts as-is', () => {
      expect(formatAmount('1000T')).toBe('1000T');
      expect(formatAmount('Free')).toBe('Free');
    });

    it('should handle falsy values', () => {
      expect(formatAmount(null as any)).toBe('0');
      expect(formatAmount(undefined as any)).toBe('0');
      expect(formatAmount('')).toBe('0');
    });
  });

  describe('filterArrayBySearch', () => {
    const testData = [
      { name: 'John', surname: 'Doe', email: 'john@example.com' },
      { name: 'Jane', surname: 'Smith', email: 'jane@example.com' },
      { name: 'Bob', surname: 'Johnson', email: 'bob@test.com' }
    ];

    it('should filter by single field', () => {
      const result = filterArrayBySearch(testData, 'john', ['name']);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John');
    });

    it('should filter by multiple fields', () => {
      const result = filterArrayBySearch(testData, 'john', ['name', 'surname', 'email']);
      expect(result).toHaveLength(2); // John Doe and Bob Johnson
    });

    it('should be case insensitive', () => {
      const result = filterArrayBySearch(testData, 'JANE', ['name']);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Jane');
    });

    it('should return all items when search query is empty', () => {
      const result = filterArrayBySearch(testData, '', ['name']);
      expect(result).toHaveLength(3);
    });

    it('should handle nested properties', () => {
      const nestedData = [
        { user: { profile: { name: 'John' } } },
        { user: { profile: { name: 'Jane' } } }
      ];
      
      const result = filterArrayBySearch(nestedData, 'john', ['user.profile.name']);
      expect(result).toHaveLength(1);
    });
  });

  describe('paginateArray', () => {
    const testData = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

    it('should return correct page items', () => {
      const result = paginateArray(testData, 1, 10);
      expect(result).toHaveLength(10);
      expect(result[0].id).toBe(1);
      expect(result[9].id).toBe(10);
    });

    it('should handle last page with fewer items', () => {
      const result = paginateArray(testData, 3, 10);
      expect(result).toHaveLength(5); // Last page has 5 items
      expect(result[0].id).toBe(21);
      expect(result[4].id).toBe(25);
    });

    it('should handle page beyond data range', () => {
      const result = paginateArray(testData, 10, 10);
      expect(result).toHaveLength(0);
    });

    it('should handle first page correctly', () => {
      const result = paginateArray(testData, 1, 5);
      expect(result).toHaveLength(5);
      expect(result[0].id).toBe(1);
    });
  });

  describe('calculateTotalPages', () => {
    it('should calculate correct number of pages', () => {
      expect(calculateTotalPages(25, 10)).toBe(3);
      expect(calculateTotalPages(30, 10)).toBe(3);
      expect(calculateTotalPages(31, 10)).toBe(4);
    });

    it('should return minimum of 1 page', () => {
      expect(calculateTotalPages(0, 10)).toBe(1);
      expect(calculateTotalPages(5, 10)).toBe(1);
    });

    it('should handle edge cases', () => {
      expect(calculateTotalPages(1, 1)).toBe(1);
      expect(calculateTotalPages(100, 1)).toBe(100);
    });
  });

  describe('downloadBlob', () => {
    it('should create download link and trigger download', () => {
      // Mock DOM methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        remove: vi.fn(),
        setAttribute: vi.fn(),
      };

      const mockURL = {
        createObjectURL: vi.fn(() => 'mock-url'),
        revokeObjectURL: vi.fn(),
      };

      // Mock global objects
      Object.defineProperty(window, 'URL', { value: mockURL });
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);

      const blob = new Blob(['test data'], { type: 'text/plain' });
      downloadBlob(blob, 'test.txt');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test.txt');
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
      expect(mockURL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test..test@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('debounce', () => {
    it('should delay function execution', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('should cancel previous calls', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });
  });
});