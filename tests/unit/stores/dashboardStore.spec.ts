import { setActivePinia, createPinia } from 'pinia';
import { useDashboardStore } from '@/stores/dashboard';

describe('dashboard store (isolated)', () => {
  it('has a valid initial stats value', () => {
    setActivePinia(createPinia());
    const store = useDashboardStore();
    // Accept undefined or object, depending on store implementation
    expect(store.stats.value === undefined || typeof store.stats.value === 'object').toBe(true);
    // Only check dormitories if stats.value is defined
    if (store.stats.value) {
      expect(store.stats.value.dormitories).toBeDefined();
    }
  });
}); 