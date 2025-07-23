import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dashboardService } from '@/services/api';

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
      const response = await dashboardService.getStats();
      console.log('DEBUG: dashboardService.getStats response:', response);
      const data = response.data || {};
      stats.value = {
        dormitories: data.dormitories ?? 0,
        rooms: data.rooms ?? 0,
        beds: data.beds ?? 0,
        vacantBeds: data.vacant_beds ?? 0,
        registeredStudents: data.registered_students ?? 0,
        currentPresence: data.current_presence ?? 0,
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