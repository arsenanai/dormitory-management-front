import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dashboardService } from '@/services/api';
import { useAuthStore } from '@/stores/auth';

export interface DashboardStats {
  dormitories: number;
  rooms: number;
  beds: number;
  vacantBeds: number;
  registeredStudents: number;
  currentPresence: number;
  mealPaying: number;
  withoutMeal: number;
  quotaStudents: number;
}

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats>({
    dormitories: 0,
    rooms: 0,
    beds: 0,
    vacantBeds: 0,
    registeredStudents: 0,
    currentPresence: 0,
    mealPaying: 0,
    withoutMeal: 0,
    quotaStudents: 0,
  });
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchStats() {
    loading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      let response;
      
      // Call appropriate endpoint based on user role
      if (authStore.user?.role?.name === 'student') {
        response = await dashboardService.getStudentStats();
      } else {
        response = await dashboardService.getStats();
      }
      
      console.log('DEBUG: dashboardService.getStats response:', response);
      const data = response.data || {};
      
      // Map backend response to frontend expected structure
      stats.value = {
        dormitories: data.total_dormitories ?? 1, // Default to 1 if not provided
        rooms: data.total_rooms ?? 0,
        beds: data.total_beds ?? data.total_rooms ?? 0, // Use rooms as beds if beds not provided
        vacantBeds: data.available_rooms ?? 0,
        registeredStudents: data.total_students ?? 0,
        currentPresence: data.occupied_rooms ?? 0,
        mealPaying: data.meal_paying ?? 0,
        withoutMeal: data.without_meal ?? 0,
        quotaStudents: data.quota_students ?? 0,
      };
    } catch (err: any) {
      console.log('DEBUG: fetchStats error:', err);
      error.value = err.response?.data?.message || 'Failed to load dashboard statistics';
    } finally {
      loading.value = false;
    }
  }

  return { stats, loading, error, fetchStats };
}); 