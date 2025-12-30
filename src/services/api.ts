import axios from "axios";
import type { User, UserProfile } from "@/models/User";
import type { AdminProfile } from "@/models/AdminProfile";
import type { GuestProfile } from "@/models/GuestProfile";
import type { Message } from "@/models/Message";
import type { Payment } from "@/models/Payment";
import type { Room } from "@/models/Room";
import type { RoomType } from "@/models/RoomType";
import type { Dormitory } from "@/models/Dormitory";
import type { Bed } from "@/models/Bed";
import type { StudentProfile } from "@/models/StudentProfile";
import type { Configuration } from "@/models/Configuration";
import type { PublicSettings } from "@/models/PublicSettings";

/*
// Define proper interfaces for all API types
interface User {
  id: number;
  name: string;
  email: string;
  phone_numbers: string[];
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserRegistration {
  iin: string;
  name: string;
  faculty: string;
  specialist: string;
  enrollmentYear: string;
  gender: string;
  email: string;
  phoneNumbers: string[];
  room: string | null;
  password: string;
  confirmPassword: string;
  dealNumber: string;
  city: string | null;
  files: (File | null)[];
  agreeToDormitoryRules: boolean;
  status: string;
  roles: string[];
}

interface UserProfile {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone_numbers: string[];
  [key: string]: unknown;
}

interface Student {
  id: number;
  name: string;
  email: string;
  faculty: string;
  specialist: string;
  enrollment_year: string;
  gender: string;
  room_id?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface StudentProfile {
  id: number;
  user_id: number;
  faculty: string;
  specialist: string;
  enrollment_year: string;
  gender: string;
  [key: string]: unknown;
}

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  dormitory_id?: number;
  created_at: string;
  updated_at: string;
}

interface AdminProfile {
  id: number;
  user_id: number;
  department: string;
  position: string;
  [key: string]: unknown;
}

interface Guest {
  id?: number;
  first_name?: string;
  last_name?: string;
  name: string;
  email?: string;
  phone?: string;
  room_id?: number;
  check_in_date: string;
  check_out_date?: string;
  payment_status?: string;
  total_amount: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface GuestProfile {
  id: number;
  user_id: number;
  purpose_of_visit: string;
  host_name: string;
  daily_rate: number;
  [key: string]: unknown;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id?: number;
  subject: string;
  content: string;
  type: string;
  status: string;
  sent_at: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: number;
  user_id: number;
  amount: number;
  payment_type: string;
  payment_date: string;
  status: string;
  description?: string;
  semester?: string;
  year?: number;
  semester_type?: string;
  due_date?: string;
  payment_notes?: string;
  dormitory_notes?: string;
  created_at: string;
  updated_at: string;
}

interface Room {
  id: number;
  number: string;
  floor: number | null;
  dormitory_id: number;
  dormitory?: Dormitory;
  room_type_id?: number;
  roomType?: RoomType;
  is_occupied: boolean;
  notes?: string;
  quota?: number;
  created_at: string;
  updated_at: string;
  beds?: Bed[];
  occupant_type?: 'student' | 'guest';
}

interface RoomType {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

interface Dormitory {
  id: number;
  name: string;
  address: string;
  capacity: number;
  gender: string;
  admin_id?: number;
  created_at: string;
  updated_at: string;
}

interface Bed {
  id: number;
  room_id: number;
  number: string;
  is_occupied: boolean;
  reserved_for_staff: boolean;
  user_id?: number;
  created_at: string;
  updated_at: string;
}
*/

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface FilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  [key: string]: unknown;
}

// API instance
export const resolvedBaseUrl = // Export resolvedBaseUrl
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.host.includes("localhost:3000")
    ? "http://localhost:8000/api"
    : "/api");

const api = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const authService = {
  login: (credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => api.post("/login", credentials),

  register: (userData: any): Promise<ApiResponse<{ user: User; message?: string }>> => {
    return api.post("/register", userData, { headers: { "Content-Type": "multipart/form-data" } });
  },

  logout: (): Promise<ApiResponse<{ message: string }>> => api.post("/logout"),

  loadProfile: (): Promise<ApiResponse<User>> => api.get("/users/profile"),

  getProfile: (): Promise<ApiResponse<User>> => api.get("/users/profile"),

  updateProfile: (data: Partial<UserProfile>): Promise<ApiResponse<User>> =>
    api.put("/users/profile", data),

  resetPassword: (email: string): Promise<ApiResponse<{ message: string }>> =>
    api.post("/password/reset-link", { email }),

  resetPasswordConfirm: (data: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }): Promise<ApiResponse<{ message: string }>> => api.post("/password/reset", data),

  changePassword: (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<ApiResponse<{ message: string }>> => api.put("/users/change-password", data),
};

export const personalDataService = {
  get: (): Promise<ApiResponse<User>> => api.get("/users/personal-data"),

  update: (data: FormData | Record<string, unknown>): Promise<ApiResponse<User>> => {
    const config =
      data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;
    return api.post("/users/personal-data", data, config);
  },
};

// User service
export const userService = {
  getAll: (params?: FilterParams): Promise<ApiResponse<PaginatedResponse<User>>> =>
    api.get("/users", { params }),

  getById: (id: number): Promise<ApiResponse<User>> => api.get(`/users/${id}`),

  create: (data: Partial<User>): Promise<ApiResponse<User>> => api.post("/users", data),

  update: (id: number, data: Partial<User>): Promise<ApiResponse<User>> =>
    api.put(`/users/${id}`, data),

  delete: (id: number): Promise<ApiResponse<{ message: string }>> => api.delete(`/users/${id}`),

  export: (params?: FilterParams): Promise<Blob> =>
    api.get("/users/export", { params, responseType: "blob" }),
};

// Student service
export const studentService = {
  getAll: (params?: FilterParams): Promise<ApiResponse<PaginatedResponse<User>>> =>
    api.get("/students", { params }),

  getById: (id: number): Promise<ApiResponse<User>> => api.get(`/students/${id}`),

  create: (data: Partial<User>): Promise<ApiResponse<User>> =>
    api.post("/students", data, { headers: { "Content-Type": "multipart/form-data" } }),

  update: (id: number, data: Partial<User>): Promise<ApiResponse<User>> =>
    api.post(`/students/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }),

  delete: (id: number): Promise<ApiResponse<{ message: string }>> => api.delete(`/students/${id}`),

  export: (params?: FilterParams): Promise<Blob> =>
    api.get("/students/export", { params, responseType: "blob" }),

  getByDormitory: (
    dormitoryId: number,
    params?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<User>>> =>
    api.get(`/dormitories/${dormitoryId}/students`, { params }),

  getUnassigned: (params?: FilterParams): Promise<ApiResponse<PaginatedResponse<User>>> =>
    api.get("/students/unassigned", { params }),

  updateAccess: (id: number, data: { can_access: boolean }): Promise<ApiResponse<User>> =>
    api.put(`/students/${id}/access`, data),

  getStatistics: (params?: FilterParams): Promise<ApiResponse<Record<string, unknown>>> =>
    api.get("/students/statistics", { params }),

  approve: (id: number): Promise<ApiResponse<User>> => api.patch(`/students/${id}/approve`),

  listAll: (): Promise<ApiResponse<Partial<User>[]>> => api.get("/students-list"),
};

// Admin service
export const adminService = {
  getAll: (params?: FilterParams): Promise<ApiResponse<PaginatedResponse<User>>> =>
    api.get("/admins", { params }),

  getById: (id: number): Promise<ApiResponse<User>> => api.get(`/admins/${id}`),

  create: (data: Partial<User>): Promise<ApiResponse<User>> => api.post("/admins", data),

  update: (id: number, data: Partial<User>): Promise<ApiResponse<User>> =>
    api.put(`/admins/${id}`, data),

  delete: (id: number): Promise<ApiResponse<{ message: string }>> => api.delete(`/admins/${id}`),

  export: (params?: FilterParams): Promise<Blob> =>
    api.get("/admins/export", { params, responseType: "blob" }),
};

// Message service
export const messageService = {
  getAll: (params?: FilterParams): Promise<ApiResponse<PaginatedResponse<Message>>> =>
    api.get("/messages", { params }),

  getById: (id: number): Promise<ApiResponse<Message>> => api.get(`/messages/${id}`),

  getMyMessages: (params?: FilterParams): Promise<ApiResponse<PaginatedResponse<Message>>> =>
    api.get("/my-messages", { params }),

  create: (data: Partial<Message>): Promise<ApiResponse<Message>> => api.post("/messages", data),

  update: (id: number, data: Partial<Message>): Promise<ApiResponse<Message>> =>
    api.put(`/messages/${id}`, data),

  delete: (id: number): Promise<ApiResponse<{ message: string }>> => api.delete(`/messages/${id}`),

  markAsRead: (id: number): Promise<ApiResponse<{ message: string }>> =>
    api.post(`/messages/${id}/read`),

  send: (id: number): Promise<ApiResponse<{ message: string }>> => api.post(`/messages/${id}/send`),

  getUnreadCount: (): Promise<ApiResponse<{ count: number }>> => api.get("/messages/unread-count"),
};

// Payment service
export const paymentService = {
  getAll: (params?: FilterParams): Promise<ApiResponse<PaginatedResponse<Payment>>> =>
    api.get("/payments", { params }),

  getMyPayments: (params?: FilterParams): Promise<ApiResponse<PaginatedResponse<Payment>>> =>
    api.get("/my-payments", { params }),

  getById: (id: number): Promise<ApiResponse<Payment>> => api.get(`/payments/${id}`),

  create: (data: FormData): Promise<ApiResponse<Payment>> =>
    api.post("/payments", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  createForSelf: (data: FormData): Promise<ApiResponse<Payment>> =>
    api.post("/my-payments", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: number, data: FormData): Promise<ApiResponse<Payment>> => {
    // Use POST for updates with FormData to support file uploads via `_method` field.
    return api.post(`/payments/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (id: number): Promise<ApiResponse<{ message: string }>> => api.delete(`/payments/${id}`),

  export: (params?: FilterParams): Promise<Blob> =>
    api.get("/payments/export", { params, responseType: "blob" }),

  getStats: (params?: FilterParams): Promise<ApiResponse<Record<string, unknown>>> =>
    api.get("/payments/stats", { params }),
};

// Room service
export const roomService = {
  getAll: (params?: FilterParams): Promise<ApiResponse<PaginatedResponse<Room>>> => {
    // Check if user is authenticated (has token)
    const token = localStorage.getItem("token");
    if (token) {
      // Use authenticated endpoint for role-based filtering
      return api.get("/rooms", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      // Use public endpoint for unauthenticated users
      return api.get("/rooms", { params });
    }
  },

  getById: (id: number): Promise<ApiResponse<Room>> => api.get(`/rooms/${id}`),

  create: (data: Partial<Room>): Promise<ApiResponse<Room>> => api.post("/rooms", data),

  update: (id: number, data: Partial<Room>): Promise<ApiResponse<Room>> =>
    api.put(`/rooms/${id}`, data),

  delete: (id: number): Promise<ApiResponse<{ message: string }>> => api.delete(`/rooms/${id}`),

  getAvailable: (params?: FilterParams): Promise<ApiResponse<Room[]>> =>
    api.get("/rooms/available", { params }),

  listAll: (): Promise<ApiResponse<Partial<Room>[]>> => api.get("/rooms-list"),
};

// RoomType service
export const roomTypeService = {
  getAll: (params?: FilterParams): Promise<ApiResponse<PaginatedResponse<RoomType>>> =>
    api.get("/room-types", { params }),

  getById: (id: number): Promise<ApiResponse<RoomType>> => api.get(`/room-types/${id}`),

  create: (data: Partial<RoomType>): Promise<ApiResponse<RoomType>> =>
    api.post("/room-types", data),

  update: (id: number, data: Partial<RoomType>): Promise<ApiResponse<RoomType>> =>
    api.put(`/room-types/${id}`, data),

  delete: (id: number): Promise<ApiResponse<{ message: string }>> =>
    api.delete(`/room-types/${id}`),

  export: (params?: FilterParams): Promise<Blob> =>
    api.get("/room-types/export", { params, responseType: "blob" }),
};

// Dormitory service
export const dormitoryService = {
  getAll: (params?: FilterParams): Promise<ApiResponse<Dormitory[]>> => {
    // Check if user is authenticated (has token)
    const token = localStorage.getItem("token");
    if (token) {
      // Use authenticated endpoint for role-based filtering
      return api.get("/dormitories/authenticated", {
        params,
        headers: { "Cache-Control": "no-cache" },
      });
    } else {
      // Use public endpoint for unauthenticated users
      return api.get("/dormitories", {
        params,
        headers: { "Cache-Control": "no-cache" },
      });
    }
  },

  getById: (id: number): Promise<ApiResponse<Dormitory>> =>
    api.get(`/dormitories/${id}`, {
      params: { _t: Date.now() }, // Add timestamp to prevent caching
      headers: { "Cache-Control": "no-cache" },
    }),

  create: (data: Partial<Dormitory>): Promise<ApiResponse<Dormitory>> =>
    api.post("/dormitories", data),

  update: (id: number, data: Partial<Dormitory>): Promise<ApiResponse<Dormitory>> =>
    api.put(`/dormitories/${id}`, data),

  delete: (id: number): Promise<ApiResponse<{ message: string }>> =>
    api.delete(`/dormitories/${id}`),

  export: (params?: FilterParams): Promise<Blob> =>
    api.get("/dormitories/export", { params, responseType: "blob" }),

  assignAdmin: (dormitoryId: number, adminId: number): Promise<ApiResponse<Dormitory>> =>
    api.post(`/dormitories/${dormitoryId}/assign-admin`, { admin_id: adminId }),

  getRegistrationData: (dormitoryId: number): Promise<ApiResponse<any>> =>
    api.get(`/dormitories/${dormitoryId}/registration`),
};

// Guest service
export const guestService = {
  getAll: (params?: FilterParams): Promise<ApiResponse<PaginatedResponse<User>>> =>
    api.get("/guests", { params }),

  getById: (id: number): Promise<ApiResponse<User>> => api.get(`/guests/${id}`),

  create: (data: Partial<User>): Promise<ApiResponse<User>> => api.post("/guests", data),

  update: (id: number, data: Partial<User>): Promise<ApiResponse<User>> =>
    api.put(`/guests/${id}`, data),

  delete: (id: number): Promise<ApiResponse<{ message: string }>> => api.delete(`/guests/${id}`),

  listAll: (): Promise<ApiResponse<Partial<User>[]>> => api.get("/guests-list"),

  getPayments: (params?: FilterParams): Promise<ApiResponse<PaginatedResponse<Payment>>> =>
    api.get("/guests/payments", { params }),

  checkIn: (id: number): Promise<ApiResponse<Guest>> => api.put(`/guests/${id}/check-in`),

  checkOut: (id: number): Promise<ApiResponse<Guest>> => api.put(`/guests/${id}/check-out`),

  export: (params?: FilterParams): Promise<Blob> =>
    api.get("/guests/export", { params, responseType: "blob" }),

  getAvailableRooms: (params?: FilterParams): Promise<ApiResponse<Room[]>> =>
    api.get("/rooms/available", { params: { ...params, occupant_type: "guest" } }),
};

// Bed service
export const bedService = {
  getAll: (params?: FilterParams): Promise<ApiResponse<PaginatedResponse<Bed>>> =>
    api.get("/beds", { params }),

  getById: (id: number): Promise<ApiResponse<Bed>> => api.get(`/beds/${id}`),

  create: (data: Partial<Bed>): Promise<ApiResponse<Bed>> => api.post("/beds", data),

  update: (id: number, data: Partial<Bed>): Promise<ApiResponse<Bed>> =>
    api.put(`/beds/${id}`, data),

  delete: (id: number): Promise<ApiResponse<{ message: string }>> => api.delete(`/beds/${id}`),

  getAvailable: (params?: FilterParams): Promise<ApiResponse<Bed[]>> =>
    api.get("/beds/available", { params }),

  assignUser: (id: number, userId: number): Promise<ApiResponse<Bed>> =>
    api.put(`/beds/${id}/assign`, { user_id: userId }),

  unassignUser: (id: number): Promise<ApiResponse<Bed>> => api.put(`/beds/${id}/unassign`),
};

// Configuration service
export const configurationService = {
  getAll: (): Promise<ApiResponse<Configuration[]>> => api.get("/configurations"),

  getByKey: (key: string): Promise<ApiResponse<Configuration>> => api.get(`/configurations/${key}`),

  update: (key: string, value: string): Promise<ApiResponse<Configuration>> =>
    api.put(`/configurations/${key}`, { value }),

  updateMultiple: (configurations: Record<string, string>): Promise<ApiResponse<Configuration[]>> =>
    api.put("/configurations", { configurations }),

  getSMTP: (): Promise<ApiResponse<Record<string, unknown>>> => api.get("/configurations/smtp"),

  updateSMTP: (settings: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> =>
    api.put("/configurations/smtp", settings),

  getSystemLogs: (): Promise<ApiResponse<string[]>> => api.get("/configurations/logs"),

  clearSystemLogs: (): Promise<ApiResponse<{ message: string }>> =>
    api.delete("/configurations/logs"),

  uploadLanguageFile: (file: File, language: string): Promise<ApiResponse<{ message: string }>> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    return api.post("/configurations/language-upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getDormitorySettings: (): Promise<ApiResponse<Record<string, unknown>>> =>
    api.get("/configurations/dormitory"),

  getPublicSettings: (): Promise<PublicSettings> =>
    api.get<PublicSettings>("/configurations/public").then((res) => res.data),

  updateDormitoryRules: (rules: string): Promise<ApiResponse<Record<string, unknown>>> =>
    api.put("/configurations/dormitory-rules", { dormitory_rules: rules }),

  updateBankRequisites: (value: string): Promise<ApiResponse<Record<string, unknown>>> =>
    api.put("/configurations/bank-requisites", { bank_requisites: value }),

  updateDormitorySettings: (
    settings: Record<string, unknown>
  ): Promise<ApiResponse<Record<string, unknown>>> =>
    api.put("/configurations/dormitory", settings),
};

// Dashboard service
export const dashboardService = {
  getStats: (): Promise<ApiResponse<Record<string, unknown>>> => api.get("/dashboard"),

  getDormitoryStats: (dormitoryId: number): Promise<ApiResponse<Record<string, unknown>>> =>
    api.get(`/dashboard/dormitory/${dormitoryId}`),

  getGuardStats: (): Promise<ApiResponse<Record<string, unknown>>> => api.get("/dashboard/guard"),

  getStudentStats: (): Promise<ApiResponse<Record<string, unknown>>> =>
    api.get("/dashboard/student"),

  getGuestStats: (): Promise<ApiResponse<Record<string, unknown>>> => api.get("/dashboard/guest"),

  getMonthlyStats: (): Promise<ApiResponse<Record<string, unknown>>> =>
    api.get("/dashboard/monthly"),

  getPaymentAnalytics: (): Promise<ApiResponse<Record<string, unknown>>> =>
    api.get("/dashboard/payment-analytics"),
};

// Card reader service
export const cardReaderService = {
  logEntry: (data: {
    card_number: string;
    location: string;
  }): Promise<ApiResponse<Record<string, unknown>>> => api.post("/card-reader/log", data),

  getCurrentPresence: (userId: number): Promise<ApiResponse<Record<string, unknown>>> =>
    api.get(`/card-reader/presence/${userId}`),

  getUsersInside: (location?: string): Promise<ApiResponse<Record<string, unknown>[]>> =>
    api.get("/card-reader/users-inside", { params: { location } }),

  getLogs: (
    params?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<Record<string, unknown>>>> =>
    api.get("/card-reader/logs", { params }),

  getAttendanceReport: (date?: string): Promise<ApiResponse<Record<string, unknown>>> =>
    api.get("/card-reader/attendance-report", { params: { date } }),

  getMonthlyReport: (
    month?: number,
    year?: number
  ): Promise<ApiResponse<Record<string, unknown>>> =>
    api.get("/card-reader/monthly-report", { params: { month, year } }),

  exportLogs: (params?: FilterParams): Promise<Blob> =>
    api.get("/card-reader/export", { params, responseType: "blob" }),
};

export const accountingApi = {
  getAccountingData: (
    params?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<Record<string, unknown>>>> =>
    api.get("/accounting", { params }),

  getStudentAccounting: (
    studentId: number,
    params?: FilterParams
  ): Promise<ApiResponse<Record<string, unknown>>> =>
    api.get(`/accounting/student/${studentId}`, { params }),

  getSemesterAccounting: (
    semester: string,
    params?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<Record<string, unknown>>>> =>
    api.get(`/accounting/semester/${semester}`, { params }),

  exportAccounting: (params?: FilterParams): Promise<Blob> =>
    api.get("/accounting/export", { params, responseType: "blob" }),

  getAccountingStats: (params?: FilterParams): Promise<ApiResponse<Record<string, unknown>>> =>
    api.get("/accounting/stats", { params }),
};

// Dormitory access service
export const dormitoryAccessService = {
  checkAccess: (userId: number): Promise<ApiResponse<{ can_access: boolean; reason?: string }>> =>
    api.get(`/dormitory-access/check/${userId}`),

  getUsersWithAccess: (): Promise<ApiResponse<User[]>> => api.get("/dormitory-access/users"),

  getAccessLogs: (
    params?: FilterParams
  ): Promise<ApiResponse<PaginatedResponse<Record<string, unknown>>>> =>
    api.get("/dormitory-access/logs", { params }),
};

export default api;
