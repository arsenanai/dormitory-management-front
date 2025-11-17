import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { createTestingPinia } from '@pinia/testing'
import GuestHome from '@/pages/GuestHome.vue';

// Mock the API service
vi.mock('@/services/api', () => ({
  dashboardService: {
    getGuestStats: vi.fn(),
  },
}));

// Mock the composables
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
    showConfirmation: vi.fn().mockResolvedValue(true)
  })
}))

// Mock i18n - just return the key like in other tests
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

describe('GuestHome', () => {
  let wrapper: ReturnType<typeof mount>;
  let router: any;
  let mockDashboardService: any;

  // Helper function to create mock axios response
  const createMockAxiosResponse = (data: any) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers: {}
    }
  } as any)

  // Mock guest data structure (same as what would be used in E2E tests)
  const mockGuestInfo = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    room_info: {
      room_number: '101',
      dormitory_name: 'Dormitory A',
      floor: 1,
      capacity: 2
    },
    daily_rate: 50.00,
    check_in_date: '2024-01-01',
    check_out_date: '2024-01-06',
    total_days: 5,
    total_amount: 25000,
    reception_contacts: {
      main: '+7 700 123 4567',
      emergency: '+7 700 987 6543'
    }
  };

  beforeEach(async () => {
    router = createRouterMock()
    injectRouterMock(router)
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Get the mocked service
    const { dashboardService } = await import('@/services/api');
    mockDashboardService = dashboardService;
    
    // Mock successful API response by default
    mockDashboardService.getGuestStats.mockResolvedValue(createMockAxiosResponse(mockGuestInfo));

    wrapper = mount(GuestHome, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ],
        stubs: {
          Navigation: { 
            template: '<div><slot /></div>' 
          },
          BuildingOfficeIcon: { template: '<span>BuildingOfficeIcon</span>' },
          CurrencyDollarIcon: { template: '<span>CurrencyDollarIcon</span>' },
          PhoneIcon: { template: '<span>PhoneIcon</span>' },
          EnvelopeIcon: { template: '<span>EnvelopeIcon</span>' },
          UserIcon: { template: '<span>UserIcon</span>' },
          ChatBubbleLeftRightIcon: { template: '<span>ChatBubbleLeftRightIcon</span>' }
        }
      },
    });
  });

  it('renders guest dashboard title', () => {
    expect(wrapper.text()).toContain('guest.home.title');
  });

  it('renders guest dashboard subtitle', () => {
    expect(wrapper.text()).toContain('guest.home.subtitle');
  });

  it('displays living room information section', () => {
    expect(wrapper.text()).toContain('guest.home.livingRoom.title');
    expect(wrapper.text()).toContain('guest.home.livingRoom.roomNumber');
    expect(wrapper.text()).toContain('guest.home.livingRoom.dormitory');
    expect(wrapper.text()).toContain('guest.home.livingRoom.floor');
    expect(wrapper.text()).toContain('guest.home.livingRoom.capacity');
  });

  it('displays rental information section', () => {
    expect(wrapper.text()).toContain('guest.home.rental.title');
    expect(wrapper.text()).toContain('guest.home.rental.dailyRate');
    expect(wrapper.text()).toContain('guest.home.rental.checkInDate');
    expect(wrapper.text()).toContain('guest.home.rental.checkOutDate');
    expect(wrapper.text()).toContain('guest.home.rental.totalDays');
    expect(wrapper.text()).toContain('guest.home.rental.totalAmount');
  });

  it('displays reception contacts section', () => {
    expect(wrapper.text()).toContain('guest.home.reception.title');
    expect(wrapper.text()).toContain('guest.home.reception.mainContact');
    expect(wrapper.text()).toContain('guest.home.reception.emergencyContact');
    // The component shows "Available 24/7" directly, not as a translation key
    expect(wrapper.text()).toContain('Available 24/7');
  });

  it('displays quick actions section', () => {
    expect(wrapper.text()).toContain('guest.home.quickActions.title');
    expect(wrapper.text()).toContain('guest.home.quickActions.messages');
    expect(wrapper.text()).toContain('guest.home.quickActions.profile');
    expect(wrapper.text()).toContain('guest.home.quickActions.contact');
  });

  it('shows room information when available', async () => {
    await wrapper.vm.$nextTick();
    
    // Check that room information is displayed
    expect(wrapper.text()).toContain('101'); // Room number
    expect(wrapper.text()).toContain('Dormitory A'); // Dormitory name
    expect(wrapper.text()).toContain('1'); // Floor
    expect(wrapper.text()).toContain('2'); // Capacity
  });

  it('shows rental information when available', async () => {
    await wrapper.vm.$nextTick();
    
    // Check that rental information is displayed
    expect(wrapper.text()).toContain('₸50.00'); // Daily rate
    expect(wrapper.text()).toContain('₸250.00'); // Total amount (5 days * 50.00)
  });

  it('navigates to messages when messages button is clicked', async () => {
    const buttons = wrapper.findAll('button');
    const messagesButton = buttons.find(btn => btn.text().includes('guest.home.quickActions.messages'));
    
    if (messagesButton) {
      await messagesButton.trigger('click');
      expect(router.push).toHaveBeenCalledWith('/messages');
    }
  });

  it('navigates to profile when profile button is clicked', async () => {
    const buttons = wrapper.findAll('button');
    const profileButton = buttons.find(btn => btn.text().includes('guest.home.quickActions.profile'));
    
    if (profileButton) {
      await profileButton.trigger('click');
      expect(router.push).toHaveBeenCalledWith('/guest-form');
    }
  });

  it('opens phone dialer when contact reception button is clicked', async () => {
    // Mock window.open
    const mockOpen = vi.fn();
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true
    });

    const buttons = wrapper.findAll('button');
    const contactButton = buttons.find(btn => btn.text().includes('guest.home.quickActions.contact'));
    
    if (contactButton) {
      await contactButton.trigger('click');
      expect(mockOpen).toHaveBeenCalledWith('tel:+7 (777) 123-45-67', '_blank');
    }
  });

  it('formats currency correctly', () => {
    const component = wrapper.vm;
    expect(component.formatCurrency(50.00)).toContain('₸');
    expect(component.formatCurrency(50.00)).toContain('50.00');
  });

  it('formats date correctly', () => {
    const component = wrapper.vm;
    const formattedDate = component.formatDate('2024-01-15');
    expect(formattedDate).toBeDefined();
    expect(typeof formattedDate).toBe('string');
  });

  it('shows not available for null dates', () => {
    const component = wrapper.vm;
    expect(component.formatDate(null)).toBe('common.notAvailable');
  });

  it('calls dashboardService.getGuestStats on mount', () => {
    expect(mockDashboardService.getGuestStats).toHaveBeenCalled();
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    mockDashboardService.getGuestStats.mockRejectedValueOnce(new Error('API Error'));
    
    // Re-mount component to trigger the error
    wrapper = mount(GuestHome, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ],
        stubs: {
          Navigation: { 
            template: '<div><slot /></div>' 
          },
          BuildingOfficeIcon: { template: '<span>BuildingOfficeIcon</span>' },
          CurrencyDollarIcon: { template: '<span>CurrencyDollarIcon</span>' },
          PhoneIcon: { template: '<span>PhoneIcon</span>' },
          EnvelopeIcon: { template: '<span>EnvelopeIcon</span>' },
          UserIcon: { template: '<span>UserIcon</span>' },
          ChatBubbleLeftRightIcon: { template: '<span>ChatBubbleLeftRightIcon</span>' }
        }
      },
    });

    // Wait for the component to process the error
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should show error message
    expect(wrapper.text()).toContain('Failed to load guest information');
  });
}); 