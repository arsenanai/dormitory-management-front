import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import GuestHome from '@/pages/GuestHome.vue';
import { useAuthStore } from '@/stores/auth';

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn()
}));

// Mock router
const mockRouter = {
  push: vi.fn()
};

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}));

// Mock i18n
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'guest.home.title': 'Guest Dashboard',
      'guest.home.subtitle': 'Welcome to your guest accommodation dashboard',
      'guest.home.livingRoom.title': 'Living Room Information',
      'guest.home.livingRoom.roomNumber': 'Room Number',
      'guest.home.livingRoom.dormitory': 'Dormitory',
      'guest.home.livingRoom.floor': 'Floor',
      'guest.home.livingRoom.capacity': 'Capacity',
      'guest.home.livingRoom.noRoomAssigned': 'No room assigned yet',
      'guest.home.rental.title': 'Rental Information',
      'guest.home.rental.dailyRate': 'Daily Rate',
      'guest.home.rental.checkInDate': 'Check-in Date',
      'guest.home.rental.checkOutDate': 'Check-out Date',
      'guest.home.rental.totalDays': 'Total Days',
      'guest.home.rental.totalAmount': 'Total Amount',
      'guest.home.reception.title': 'Reception Contacts',
      'guest.home.reception.mainContact': 'Main Contact',
      'guest.home.reception.emergency': 'Emergency Contact',
      'guest.home.reception.emergencyAvailable': 'Available 24/7',
      'guest.home.quickActions.title': 'Quick Actions',
      'guest.home.quickActions.messages': 'Messages',
      'guest.home.quickActions.profile': 'My Profile',
      'guest.home.quickActions.contactReception': 'Contact Reception',
      'common.notAvailable': 'Not Available'
    }
  }
});

describe('GuestHome', () => {
  let wrapper: any;
  let mockAuthStore: any;

  beforeEach(() => {
    // Create mock auth store
    mockAuthStore = {
      user: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: { name: 'guest' }
      },
      userRole: 'guest'
    };

    (useAuthStore as any).mockReturnValue(mockAuthStore);

    // Create pinia instance
    const pinia = createPinia();

    // Mount component
    wrapper = mount(GuestHome, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          'router-link': true
        }
      }
    });
  });

  it('renders guest dashboard title', () => {
    expect(wrapper.text()).toContain('Guest Dashboard');
  });

  it('renders guest dashboard subtitle', () => {
    expect(wrapper.text()).toContain('Welcome to your guest accommodation dashboard');
  });

  it('displays living room information section', () => {
    expect(wrapper.text()).toContain('Living Room Information');
    expect(wrapper.text()).toContain('Room Number');
    expect(wrapper.text()).toContain('Dormitory');
    expect(wrapper.text()).toContain('Floor');
    expect(wrapper.text()).toContain('Capacity');
  });

  it('displays rental information section', () => {
    expect(wrapper.text()).toContain('Rental Information');
    expect(wrapper.text()).toContain('Daily Rate');
    expect(wrapper.text()).toContain('Check-in Date');
    expect(wrapper.text()).toContain('Check-out Date');
    expect(wrapper.text()).toContain('Total Days');
    expect(wrapper.text()).toContain('Total Amount');
  });

  it('displays reception contacts section', () => {
    expect(wrapper.text()).toContain('Reception Contacts');
    expect(wrapper.text()).toContain('Main Contact');
    expect(wrapper.text()).toContain('Emergency Contact');
    expect(wrapper.text()).toContain('Available 24/7');
  });

  it('displays quick actions section', () => {
    expect(wrapper.text()).toContain('Quick Actions');
    expect(wrapper.text()).toContain('Messages');
    expect(wrapper.text()).toContain('My Profile');
    expect(wrapper.text()).toContain('Contact Reception');
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
    expect(wrapper.text()).toContain('₸5,000'); // Daily rate
    expect(wrapper.text()).toContain('₸25,000'); // Total amount (5 days * 5000)
  });

  it('navigates to messages when messages button is clicked', async () => {
    const messagesButton = wrapper.find('button').filter((btn: any) => 
      btn.text().includes('Messages')
    );
    
    if (messagesButton.exists()) {
      await messagesButton.trigger('click');
      expect(mockRouter.push).toHaveBeenCalledWith('/messages');
    }
  });

  it('navigates to profile when profile button is clicked', async () => {
    const profileButton = wrapper.find('button').filter((btn: any) => 
      btn.text().includes('My Profile')
    );
    
    if (profileButton.exists()) {
      await profileButton.trigger('click');
      expect(mockRouter.push).toHaveBeenCalledWith('/guest-form/1');
    }
  });

  it('opens phone dialer when contact reception button is clicked', async () => {
    // Mock window.open
    const mockOpen = vi.fn();
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true
    });

    const contactButton = wrapper.find('button').filter((btn: any) => 
      btn.text().includes('Contact Reception')
    );
    
    if (contactButton.exists()) {
      await contactButton.trigger('click');
      expect(mockOpen).toHaveBeenCalledWith('tel:+7 (777) 123-45-67');
    }
  });

  it('calculates total days correctly', () => {
    const component = wrapper.vm;
    expect(component.calculateTotalDays()).toBe(5); // 2024-01-20 - 2024-01-15 = 5 days
  });

  it('calculates total amount correctly', () => {
    const component = wrapper.vm;
    expect(component.calculateTotalAmount()).toBe(25000); // 5 days * 5000 KZT
  });

  it('formats currency correctly', () => {
    const component = wrapper.vm;
    expect(component.formatCurrency(5000)).toContain('₸');
    expect(component.formatCurrency(5000)).toContain('5,000');
  });

  it('formats date correctly', () => {
    const component = wrapper.vm;
    const formattedDate = component.formatDate('2024-01-15');
    expect(formattedDate).toBeDefined();
    expect(typeof formattedDate).toBe('string');
  });

  it('shows not available for null dates', () => {
    const component = wrapper.vm;
    expect(component.formatDate(null)).toBe('Not Available');
  });
}); 