export {};
import { dashboardService } from '@/services/api';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { flushPromises, mount } from '@vue/test-utils';
import Statistics from '@/pages/Statistics.vue';
import { useDashboardStore } from '@/stores/dashboard';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';

let pinia: ReturnType<typeof createTestingPinia>;
let router: ReturnType<typeof createRouterMock>;
let dashboardStore: ReturnType<typeof useDashboardStore>;

beforeEach(() => {
  pinia = createTestingPinia({ stubActions: false });
  dashboardStore = useDashboardStore();
  router = createRouterMock();
  injectRouterMock(router);
  dashboardService.getStats = vi.fn().mockResolvedValue({
    data: {
      dormitories: 4,
      rooms: 268,
      beds: 1200,
      vacant_beds: 112,
      registered_students: 1088,
      current_presence: 1758,
      meal_paying: 1088,
      without_meal: 0,
      quota_students: 32,
    },
  });
});

describe('Statistics.vue', () => {
  it('renders all statistic cards with correct values from the store', async () => {
    const wrapper = mount(Statistics, {
      global: {
        plugins: [pinia, router],
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('4');
    expect(wrapper.text()).toContain('268');
    expect(wrapper.text()).toContain('1200');
    expect(wrapper.text()).toContain('112');
    expect(wrapper.text()).toContain('1088');
    expect(wrapper.text()).toContain('1758');
    expect(wrapper.text()).toContain('1088');
    expect(wrapper.text()).toContain('0');
    expect(wrapper.text()).toContain('32');
  });

  it('shows loading state when loading', async () => {
    dashboardStore.loading = true;
    const wrapper = mount(Statistics, {
      global: {
        plugins: [pinia, router],
      },
    });
    expect(wrapper.text()).toContain('Loading');
  });

  it('shows error state when error', async () => {
    dashboardStore.error = 'Failed to load dashboard statistics';
    const wrapper = mount(Statistics, {
      global: {
        plugins: [pinia, router],
      },
    });
    expect(wrapper.text()).toContain('Failed to load dashboard statistics');
  });

  it('updates values when store data changes', async () => {
    const wrapper = mount(Statistics, {
      global: {
        plugins: [pinia, router],
      },
    });
    await flushPromises();
    dashboardStore.stats.dormitories = 10;
    await flushPromises();
    expect(wrapper.text()).toContain('10');
  });
});
