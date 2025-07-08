/**
 * Utility functions for component helpers
 */

/**
 * Format date string to localized format (component helper version)
 * @param dateString - Date string to format
 * @returns Formatted date string or dash for invalid dates
 */
export const formatDateHelper = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString();
};

/**
 * Format amount with T suffix for numbers
 * @param amount - Amount to format
 * @returns Formatted amount string
 */
export const formatAmount = (amount: number | string | null | undefined): string => {
  if (!amount) return '0';
  return typeof amount === 'number' ? `${amount}T` : amount;
};

/**
 * Filter array by search query across multiple fields
 * @param array - Array to filter
 * @param searchQuery - Search query string
 * @param searchFields - Fields to search in
 * @returns Filtered array
 */
export const filterArrayBySearch = (array: any[], searchQuery: string, searchFields: string[]): any[] => {
  if (!searchQuery) return array;
  
  return array.filter(item => {
    return searchFields.some(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
  });
};

/**
 * Paginate array
 * @param array - Array to paginate
 * @param currentPage - Current page number (1-based)
 * @param itemsPerPage - Items per page
 * @returns Paginated array slice
 */
export const paginateArray = (array: any[], currentPage: number, itemsPerPage: number): any[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return array.slice(startIndex, endIndex);
};

/**
 * Calculate total pages for pagination
 * @param totalItems - Total number of items
 * @param itemsPerPage - Items per page
 * @returns Total number of pages
 */
export const calculateTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.max(1, Math.ceil(totalItems / itemsPerPage));
};

/**
 * Download blob as file
 * @param blob - Blob to download
 * @param filename - File name
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Validate email address (component helper version)
 * @param email - Email to validate
 * @returns True if valid email
 */
export const validateEmailHelper = (email: string): boolean => {
  // More strict email regex that doesn't allow consecutive dots
  const emailRegex = /^[^\s@.]+(?:\.[^\s@.]+)*@[^\s@.]+(?:\.[^\s@.]+)*$/;
  return emailRegex.test(email);
};

/**
 * Debounce function execution (component helper version)
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounceHelper = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};
