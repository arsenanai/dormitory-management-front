globalThis.URL = globalThis.URL || require('url').URL

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import api, { 
  authService, 
  studentService, 
  userService, 
  paymentService, 
  messageService, 
  dormitoryService, 
  roomService, 
  roomTypeService,
  dashboardService 
} from '@/services/api';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    }))
  }
}));

// Get the mocked axios instance
const mockedAxios = api;

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('authService', () => {
    it('should call login endpoint', async () => {
      const mockResponse = { data: { token: 'fake-token', user: { id: 1, name: 'Test User' } } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const loginData = { email: 'test@example.com', password: 'password' };
      const result = await authService.login(loginData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/login', loginData);
      expect(result).toEqual(mockResponse);
    });

    it('should call register endpoint', async () => {
      const mockResponse = { data: { user: { id: 1, name: 'New User' } } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const userData = { name: 'New User', email: 'new@example.com', password: 'password' };
      const result = await authService.register(userData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/register', userData);
      expect(result).toEqual(mockResponse);
    });

    it('should call profile endpoint', async () => {
      const mockResponse = { data: { id: 1, name: 'Test User' } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await authService.getProfile();

      expect(mockedAxios.get).toHaveBeenCalledWith('/users/profile');
      expect(result).toEqual(mockResponse);
    });

    it('should update profile', async () => {
      const mockResponse = { data: { message: 'Profile updated' } };
      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const profileData = { name: 'Updated Name' };
      const result = await authService.updateProfile(profileData);

      expect(mockedAxios.put).toHaveBeenCalledWith('/users/profile', profileData);
      expect(result).toEqual(mockResponse);
    });

    it('should change password', async () => {
      const mockResponse = { data: { message: 'Password changed' } };
      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const passwordData = { 
        current_password: 'old', 
        password: 'new', 
        password_confirmation: 'new' 
      };
      const result = await authService.changePassword(passwordData);

      expect(mockedAxios.put).toHaveBeenCalledWith('/users/change-password', passwordData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('studentService', () => {
    it('should get all students', async () => {
      const mockResponse = { data: [{ id: 1, name: 'Student 1' }] };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const params = { page: 1, limit: 10 };
      const result = await studentService.getAll(params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/students', { params });
      expect(result).toEqual(mockResponse);
    });

    it('should get student by id', async () => {
      const mockResponse = { data: { id: 1, name: 'Student 1' } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await studentService.getById(1);

      expect(mockedAxios.get).toHaveBeenCalledWith('/students/1');
      expect(result).toEqual(mockResponse);
    });

    it('should create student', async () => {
      const mockResponse = { data: { id: 1, name: 'New Student' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const studentData = { name: 'New Student', email: 'student@example.com' };
      const result = await studentService.create(studentData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/students', studentData);
      expect(result).toEqual(mockResponse);
    });

    it('should approve student', async () => {
      const mockResponse = { data: { message: 'Student approved' } };
      mockedAxios.patch.mockResolvedValueOnce(mockResponse);

      const result = await studentService.approve(1);

      expect(mockedAxios.patch).toHaveBeenCalledWith('/students/1/approve');
      expect(result).toEqual(mockResponse);
    });

    it('should export students', async () => {
      const mockResponse = { data: 'excel-blob-data' };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const params = { dormitory: 1 };
      const result = await studentService.export(params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/students/export', { 
        params, 
        responseType: 'blob' 
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('dormitoryService', () => {
    it('should get all dormitories', async () => {
      const mockResponse = { data: [{ id: 1, name: 'Dormitory A' }] };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await dormitoryService.getAll();

      expect(mockedAxios.get).toHaveBeenCalledWith('/dormitories', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should assign admin to dormitory', async () => {
      const mockResponse = { data: { message: 'Admin assigned' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await dormitoryService.assignAdmin(1, 2);

      expect(mockedAxios.post).toHaveBeenCalledWith('/dormitories/1/assign-admin', { admin_id: 2 });
      expect(result).toEqual(mockResponse);
    });

    it('should export dormitories', async () => {
      const mockResponse = { data: 'excel-blob-data' };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await dormitoryService.export();

      expect(mockedAxios.get).toHaveBeenCalledWith('/dormitories/export', { 
        params: undefined, 
        responseType: 'blob' 
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('messageService', () => {
    it('should get my messages', async () => {
      const mockResponse = { data: [{ id: 1, subject: 'Test Message' }] };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await messageService.getMyMessages();

      expect(mockedAxios.get).toHaveBeenCalledWith('/my-messages', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should send message', async () => {
      const mockResponse = { data: { message: 'Message sent' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await messageService.send(1);

      expect(mockedAxios.post).toHaveBeenCalledWith('/messages/1/send');
      expect(result).toEqual(mockResponse);
    });

    it('should mark message as read', async () => {
      const mockResponse = { data: { message: 'Message marked as read' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await messageService.markAsRead(1);

      expect(mockedAxios.post).toHaveBeenCalledWith('/messages/1/read');
      expect(result).toEqual(mockResponse);
    });

    it('should get unread count', async () => {
      const mockResponse = { data: { count: 5 } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await messageService.getUnreadCount();

      expect(mockedAxios.get).toHaveBeenCalledWith('/messages/unread-count');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('dashboardService', () => {
    it('should get dashboard stats', async () => {
      const mockResponse = { data: { totalStudents: 100, totalRooms: 50 } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await dashboardService.getStats();

      expect(mockedAxios.get).toHaveBeenCalledWith('/dashboard', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should get dormitory stats', async () => {
      const mockResponse = { data: { students: 30, rooms: 10 } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await dashboardService.getDormitoryStats(1);

      expect(mockedAxios.get).toHaveBeenCalledWith('/dashboard/dormitory/1');
      expect(result).toEqual(mockResponse);
    });
  });
});
