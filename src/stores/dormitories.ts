import { defineStore } from "pinia";
import { LOCAL_STORAGE_SELECTED_DORMITORY_KEY } from "@/Const";
import { dormitoryService } from "@/services/api";

interface Dormitory {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  current_occupancy?: number;
  amenities?: string[];
  rules?: string;
  manager_name?: string;
  manager_phone?: string;
  manager_email?: string;
  [key: string]: any;
}

export const useDormitoriesStore = defineStore("dormitoriesStore", {
  state: () => ({
    dormitories: [] as Dormitory[],
    selectedDormitory: null as Dormitory | null,
    loading: false,
    error: null as string | null,
  }),
  
  getters: {
    getDormitoryById: (state) => (id: number): Dormitory | null => {
      return state.dormitories.find((dorm: Dormitory) => dorm.id === id) || null;
    },
    
    totalCapacity: (state): number => {
      return state.dormitories.reduce((total, dorm) => total + (dorm.capacity || 0), 0);
    },
    
    totalOccupancy: (state): number => {
      return state.dormitories.reduce((total, dorm) => total + (dorm.current_occupancy || 0), 0);
    },
    
    occupancyRate(): number {
      if (this.totalCapacity === 0) return 0;
      return (this.totalOccupancy / this.totalCapacity) * 100;
    },
    
    availableCapacity(): number {
      return this.totalCapacity - this.totalOccupancy;
    },
  },
  
  actions: {
    async fetchDormitories() {
      try {
        this.loading = true;
        this.error = null;
        const response = await dormitoryService.getAll();
        this.dormitories = response.data;
      } catch (error: any) {
        this.error = 'Failed to fetch dormitories';
        this.dormitories = [];
      } finally {
        this.loading = false;
      }
    },
    
    async fetchDormitory(id: number): Promise<Dormitory | null> {
      try {
        this.loading = true;
        this.error = null;
        const response = await dormitoryService.getById(id);
        return response.data;
      } catch (error: any) {
        this.error = 'Failed to fetch dormitory';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async createDormitory(dormitoryData: Partial<Dormitory>): Promise<Dormitory | null> {
      try {
        this.loading = true;
        this.error = null;
        const response = await dormitoryService.create(dormitoryData);
        const newDormitory = response.data;
        this.dormitories.push(newDormitory);
        return newDormitory;
      } catch (error: any) {
        this.error = 'Failed to create dormitory';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async updateDormitory(id: number, updates: Partial<Dormitory>): Promise<Dormitory | null> {
      try {
        this.loading = true;
        this.error = null;
        const response = await dormitoryService.update(id, updates);
        const updatedDormitory = response.data;
        
        const index = this.dormitories.findIndex(dorm => dorm.id === id);
        if (index !== -1) {
          this.dormitories[index] = updatedDormitory;
        }
        
        return updatedDormitory;
      } catch (error: any) {
        this.error = 'Failed to update dormitory';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteDormitory(id: number): Promise<boolean> {
      try {
        this.loading = true;
        this.error = null;
        await dormitoryService.delete(id);
        
        const index = this.dormitories.findIndex(dorm => dorm.id === id);
        if (index !== -1) {
          this.dormitories.splice(index, 1);
        }
        
        return true;
      } catch (error: any) {
        this.error = 'Failed to delete dormitory';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    filterDormitories(searchTerm: string): Dormitory[] {
      if (!searchTerm) return this.dormitories;
      
      const term = searchTerm.toLowerCase();
      return this.dormitories.filter(dorm => 
        dorm.name?.toLowerCase().includes(term) ||
        dorm.address?.toLowerCase().includes(term) ||
        dorm.city?.toLowerCase().includes(term) ||
        dorm.manager_name?.toLowerCase().includes(term)
      );
    },
    
    filterByCapacity(minCapacity: number, maxCapacity: number): Dormitory[] {
      return this.dormitories.filter(dorm => 
        (dorm.capacity || 0) >= minCapacity && (dorm.capacity || 0) <= maxCapacity
      );
    },
    
    sortDormitories(field: keyof Dormitory, order: 'asc' | 'desc' = 'asc'): Dormitory[] {
      const sorted = [...this.dormitories].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return order === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return order === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        return 0;
      });
      
      return sorted;
    },
    
    clearError() {
      this.error = null;
    },
    
    setSelectedDormitory(dormitory: Dormitory) {
      this.selectedDormitory = JSON.parse(JSON.stringify(dormitory));
      localStorage.setItem(LOCAL_STORAGE_SELECTED_DORMITORY_KEY, JSON.stringify(this.selectedDormitory));
    },
    
    restoreSelectedDormitory() {
      const saved = localStorage.getItem(LOCAL_STORAGE_SELECTED_DORMITORY_KEY);
      if (saved) {
        this.selectedDormitory = JSON.parse(saved);
      }
    },
    
    clearSelectedDormitory() {
      this.selectedDormitory = null;
      localStorage.removeItem(LOCAL_STORAGE_SELECTED_DORMITORY_KEY);
    },
    
    setDormitories(dormitories: Dormitory[]) {
      this.dormitories = dormitories;
    },
    
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    
    setError(error: string | null) {
      this.error = error;
    },
  },
});
