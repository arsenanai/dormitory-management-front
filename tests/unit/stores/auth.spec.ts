// Add URL polyfill at the very top
globalThis.URL = globalThis.URL || require('url').URL

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

// Create mock for localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Create fresh Pinia instance
    setActivePinia(createPinia());
    // Reset all mocks
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });
  
  afterEach(() => {
    // Restore all mocks
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const authStore = useAuthStore();
    
    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBeNull();
  });

  it('should login successfully', async () => {
    const authStore = useAuthStore();
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: { id: 1, name: 'Test User', email: 'test@example.com' }
      }
    };

    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const credentials = { email: 'test@example.com', password: 'password' };
    await authStore.login(credentials);

    expect(api.post).toHaveBeenCalledWith('/login', credentials);
    expect(authStore.user).toEqual(mockResponse.data.user);
    expect(authStore.token).toBe(mockResponse.data.token);
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBeNull();
    expect(localStorage.getItem('token')).toBe(mockResponse.data.token);
  });

  it('should handle login error', async () => {
    const authStore = useAuthStore();
    const errorMessage = 'Invalid credentials';
    
    vi.mocked(api.post).mockRejectedValueOnce(new Error(errorMessage));

    const credentials = { email: 'test@example.com', password: 'wrong-password' };
    await authStore.login(credentials);

    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBe(errorMessage);
  });

  it('should logout successfully', () => {
    const authStore = useAuthStore();
    
    // Set initial authenticated state
    authStore.user = { id: 1, name: 'Test User', email: 'test@example.com' };
    authStore.token = 'mock-token';
    localStorage.setItem('token', 'mock-token');

    authStore.logout();

    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.error).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should load profile successfully', async () => {
    const authStore = useAuthStore();
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser });

    await authStore.loadProfile();

    expect(api.get).toHaveBeenCalledWith('/users/profile');
    expect(authStore.user).toEqual(mockUser);
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBeNull();
  });

  it('should handle profile loading error', async () => {
    const authStore = useAuthStore();
    const errorMessage = 'Unauthorized';
    
    vi.mocked(api.get).mockRejectedValueOnce(new Error(errorMessage));

    await authStore.loadProfile();

    expect(authStore.user).toBeNull();
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBe(errorMessage);
  });

  it('should update profile successfully', async () => {
    const authStore = useAuthStore();
    const updatedUser = { id: 1, name: 'Updated User', email: 'updated@example.com' };
    
    vi.mocked(api.put).mockResolvedValueOnce({ data: updatedUser });

    const profileData = { name: 'Updated User' };
    await authStore.updateProfile(profileData);

    expect(api.put).toHaveBeenCalledWith('/users/profile', profileData);
    expect(authStore.user).toEqual(updatedUser);
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBeNull();
  });

  it('should initialize from localStorage token', () => {
    localStorage.setItem('token', 'stored-token');
    
    const authStore = useAuthStore();
    authStore.initializeAuth();

    expect(authStore.token).toBe('stored-token');
    expect(authStore.isAuthenticated).toBe(true);
  });

  it('should handle authentication state without token', () => {
    const authStore = useAuthStore();
    authStore.initializeAuth();

    expect(authStore.token).toBeNull();
    expect(authStore.isAuthenticated).toBe(false);
  });
});
