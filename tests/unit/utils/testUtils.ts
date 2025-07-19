import { createPinia, setActivePinia } from 'pinia';
import { vi } from 'vitest';

/**
 * Helper function to create an Axios-like response
 * @param data - The response data
 * @param status - HTTP status code (default: 200)
 * @param statusText - HTTP status text (default: 'OK')
 * @param headers - Response headers (default: {})
 * @returns Axios response object
 */
export function createAxiosResponse(
  data: any,
  status: number = 200, 
  statusText: string = 'OK',
  headers: Record<string, string> = {}
) {
  return {
    data,
    status,
    statusText,
    headers,
    config: {
      headers: {},
      method: 'get',
      url: '',
    },
  };
}

/**
 * Helper function to reset the Pinia store between tests
 */
export function resetPinia() {
  setActivePinia(createPinia());
}

/**
 * Helper function to reset all mocks between tests
 */
export function resetMocks() {
  vi.resetAllMocks();
  vi.clearAllMocks();
}

/**
 * Helper function to reset localStorage between tests
 */
export function resetStorage() {
  localStorage.clear();
  sessionStorage.clear();
  vi.spyOn(Storage.prototype, 'getItem');
  vi.spyOn(Storage.prototype, 'setItem');
  vi.spyOn(Storage.prototype, 'removeItem');
}

/**
 * Helper function to reset the Pinia store and all mocks between tests
 */
export function resetTestEnvironment() {
  resetPinia();
  resetMocks();
  resetStorage();
}
