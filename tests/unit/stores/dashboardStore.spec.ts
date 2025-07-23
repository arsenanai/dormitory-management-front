import { setActivePinia, createPinia } from 'pinia';
import { useDashboardStore } from '@/stores/dashboard';

describe('dashboard store (isolated)', () => {
  it('has a valid initial stats value', () => {
    setActivePinia(createPinia());
    const store = useDashboardStore();
    console.log('DEBUG: store.stats.value on creation:', store.stats.value);
    expect(store.stats.value).toBeDefined();
    expect(typeof store.stats.value).toBe('object');
    expect(store.stats.value.dormitories).toBe(0);
  });
}); 