import { defineStore } from "pinia";
import { LOCAL_STORAGE_SELECTED_ADMIN_USER_KEY } from "@/Const";
import api from "@/services/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  gender?: string;
  room_id?: number | null;
  created_at?: string;
  dormitory?: any;
  [key: string]: any;
}

export const useUserStore = defineStore("userStore", {
  state: () => ({
    users: [] as User[],
    selectedUser: null as User | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    userStats: (state) => {
      const total = state.users.length;
      const students = state.users.filter((u) => u.role === "student").length;
      const admins = state.users.filter((u) => u.role === "admin").length;
      return { total, students, admins };
    },
  },

  actions: {
    // CRUD operations
    async fetchUsers() {
      try {
        this.loading = true;
        this.error = null;
        const response = await api.get("/users");
        this.users = response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to fetch users";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUser(id: number) {
      try {
        this.loading = true;
        this.error = null;
        const response = await api.get(`/users/${id}`);
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to fetch user";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createUser(userData: any) {
      try {
        this.loading = true;
        this.error = null;
        const response = await api.post("/users", userData);
        this.users.push(response.data);
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to create user";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateUser(id: number, userData: any) {
      try {
        this.loading = true;
        this.error = null;
        const response = await api.put(`/users/${id}`, userData);
        const index = this.users.findIndex((u) => u.id === id);
        if (index !== -1) {
          this.users[index] = response.data;
        }
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to update user";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deleteUser(id: number) {
      try {
        this.loading = true;
        this.error = null;
        await api.delete(`/users/${id}`);
        this.users = this.users.filter((u) => u.id !== id);
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to delete user";
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Utility methods
    getUserById(id: number) {
      return this.users.find((u) => u.id === id) || null;
    },

    getUsersByRole(role: string) {
      return this.users.filter((u) => u.role === role);
    },

    filterUsers(searchTerm: string) {
      if (!searchTerm) return this.users;
      const term = searchTerm.toLowerCase();
      return this.users.filter(
        (u) => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
      );
    },

    filterByGender(gender: string) {
      return this.users.filter((u) => {
        if (u.role === "student" && u.student_profile) {
          return u.student_profile.gender === gender;
        }
        if (u.role === "admin" && u.admin_profile) {
          return u.admin_profile.gender === gender;
        }
        if (u.role === "guest" && u.guest_profile) {
          return u.guest_profile.gender === gender;
        }
        return false;
      });
    },

    getUsersWithRooms() {
      return this.users.filter((u) => u.room_id !== null);
    },

    getUsersWithoutRooms() {
      return this.users.filter((u) => u.room_id === null);
    },

    sortUsers(field: string, direction: "asc" | "desc" = "asc") {
      return [...this.users].sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        if (field === "name") {
          aVal = aVal?.toLowerCase();
          bVal = bVal?.toLowerCase();
        }

        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
        return 0;
      });
    },

    validateUser(user: any) {
      return !!(user && user.name && user.email && user.role);
    },

    clearError() {
      this.error = null;
    },

    setLoading(loading: boolean) {
      this.loading = loading;
    },

    // Selected user management (existing functionality)
    setSelectedUser(user: User) {
      this.selectedUser = JSON.parse(JSON.stringify(user));
      localStorage.setItem(
        LOCAL_STORAGE_SELECTED_ADMIN_USER_KEY,
        JSON.stringify(this.selectedUser)
      );
    },

    restoreSelectedUser() {
      const saved = localStorage.getItem(LOCAL_STORAGE_SELECTED_ADMIN_USER_KEY);
      if (saved) {
        this.selectedUser = JSON.parse(saved);
      }
    },

    clearSelectedUser() {
      this.selectedUser = null;
      localStorage.removeItem(LOCAL_STORAGE_SELECTED_ADMIN_USER_KEY);
    },
  },
});
