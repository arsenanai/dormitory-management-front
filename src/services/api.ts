import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth'; // Adjust the import path based on your project structure

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string, // Ensure the environment variable is typed as a string
  timeout: 10000,
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError): Promise<AxiosError> => {
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., logout user)
      const authStore = useAuthStore(); // Ensure `useAuthStore` is properly imported
      authStore.logout();
    }
    return Promise.reject(error);
  }
);

// API Service Functions
export const authService = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/login', credentials),
  
  register: (userData: any) => 
    api.post('/register', userData),
  
  getProfile: () => 
    api.get('/users/profile'),
  
  updateProfile: (data: any) => 
    api.put('/users/profile', data),
  
  changePassword: (data: { current_password: string; password: string; password_confirmation: string }) => 
    api.put('/users/change-password', data),
  
  sendPasswordResetLink: (email: string) => 
    api.post('/password/reset-link', { email }),
  
  resetPassword: (data: { email: string; token: string; password: string; password_confirmation: string }) => 
    api.post('/password/reset', data),
};

export const studentService = {
  getAll: (params?: any) => 
    api.get('/students', { params }),
  
  getById: (id: number) => 
    api.get(`/students/${id}`),
  
  create: (data: any) => 
    api.post('/students', data),
  
  update: (id: number, data: any) => 
    api.put(`/students/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/students/${id}`),
  
  approve: (id: number) => 
    api.patch(`/students/${id}/approve`),
  
  export: (params?: any) => 
    api.get('/students/export', { params, responseType: 'blob' }),
};

export const userService = {
  getAll: (params?: any) => 
    api.get('/users', { params }),
  
  getById: (id: number) => 
    api.get(`/users/${id}`),
  
  create: (data: any) => 
    api.post('/users', data),
  
  update: (id: number, data: any) => 
    api.put(`/users/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/users/${id}`),
};

export const paymentService = {
  getAll: (params?: any) => 
    api.get('/payments', { params }),
  
  getById: (id: number) => 
    api.get(`/payments/${id}`),
  
  create: (data: any) => 
    api.post('/payments', data),
  
  update: (id: number, data: any) => 
    api.put(`/payments/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/payments/${id}`),
  
  export: (params?: any) => 
    api.get('/payments/export', { params, responseType: 'blob' }),
};

export const messageService = {
  getAll: (params?: any) => 
    api.get('/messages', { params }),
  
  getMyMessages: (params?: any) => 
    api.get('/my-messages', { params }),
  
  getById: (id: number) => 
    api.get(`/messages/${id}`),
  
  create: (data: any) => 
    api.post('/messages', data),
  
  update: (id: number, data: any) => 
    api.put(`/messages/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/messages/${id}`),
  
  send: (id: number) => 
    api.post(`/messages/${id}/send`),
  
  markAsRead: (id: number) => 
    api.post(`/messages/${id}/read`),
  
  getUnreadCount: () => 
    api.get('/messages/unread-count'),
};

export const dormitoryService = {
  getAll: (params?: any) => 
    api.get('/dormitories', { params }),
  
  getById: (id: number) => 
    api.get(`/dormitories/${id}`),
  
  create: (data: any) => 
    api.post('/dormitories', data),
  
  update: (id: number, data: any) => 
    api.put(`/dormitories/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/dormitories/${id}`),
  
  assignAdmin: (id: number, adminId: number) => 
    api.post(`/dormitories/${id}/assign-admin`, { admin_id: adminId }),
  
  export: (params?: any) => 
    api.get('/dormitories/export', { params, responseType: 'blob' }),
};

export const roomService = {
  getAll: (params?: any) => 
    api.get('/rooms', { params }),
  
  getById: (id: number) => 
    api.get(`/rooms/${id}`),
  
  create: (data: any) => 
    api.post('/rooms', data),
  
  update: (id: number, data: any) => 
    api.put(`/rooms/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/rooms/${id}`),
};

export const roomTypeService = {
  getAll: (params?: any) => 
    api.get('/room-types', { params }),
  
  getById: (id: number) => 
    api.get(`/room-types/${id}`),
  
  create: (data: any) => 
    api.post('/room-types', data),
  
  update: (id: number, data: any) => 
    api.put(`/room-types/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/room-types/${id}`),
};

export const dashboardService = {
  getStats: (params?: any) => 
    api.get('/dashboard', { params }),
  
  getDormitoryStats: (dormitoryId: number) => 
    api.get(`/dashboard/dormitory/${dormitoryId}`),
};

export const adminService = {
  getAll: (params?: any) => 
    api.get('/admins', { params }),
  getById: (id: number) => 
    api.get(`/admins/${id}`),
  create: (data: any) => 
    api.post('/admins', data),
  update: (id: number, data: any) => 
    api.put(`/admins/${id}`, data),
  delete: (id: number) => 
    api.delete(`/admins/${id}`),
};

export default api;