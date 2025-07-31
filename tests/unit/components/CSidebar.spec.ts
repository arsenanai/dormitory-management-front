import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '@/i18n';
// @ts-expect-error: Vue SFC import for test
import CSidebar from '../../../src/components/CSidebar.vue';

// Mock icons
const MockIcon = {
  template: '<svg class="mock-icon" />',
};

// Configure vue-router-mock
const router = createRouterMock();
injectRouterMock(router);

// Mock router.options.routes for CSidebar component
router.options = {
  routes: [
    {
      path: '/main',
      name: 'Main Page',
      meta: {
        title: 'Dashboard',
        icon: MockIcon,
        sidebar: true,
      },
    },
    {
      path: '/admins',
      name: 'Admins',
      meta: {
        title: 'Admins',
        icon: MockIcon,
        sidebar: true,
      },
    },
    {
      path: '/students',
      name: 'Students',
      meta: {
        title: 'Students',
        icon: MockIcon,
        sidebar: true,
      },
    },
    {
      path: '/dormitories',
      name: 'Dormitories',
      meta: {
        title: 'Dormitories',
        icon: MockIcon,
        sidebar: true,
      },
    },
    {
      path: '/rooms',
      name: 'Rooms',
      meta: {
        title: 'Rooms',
        icon: MockIcon,
        sidebar: true,
        parent: 'Dormitories',
      },
    },
    {
      path: '/room-types',
      name: 'Room Types',
      meta: {
        title: 'Room Types',
        icon: MockIcon,
        sidebar: true,
        parent: 'Dormitories',
      },
    },
    {
      path: '/payments',
      name: 'Payments',
      meta: {
        title: 'Payments',
        icon: MockIcon,
        sidebar: true,
      },
    },
    {
      path: '/messages',
      name: 'Messages',
      meta: {
        title: 'Messages',
        icon: MockIcon,
        sidebar: true,
      },
    },
    {
      path: '/settings',
      name: 'Settings',
      meta: {
        title: 'Settings',
        icon: MockIcon,
        sidebar: false,
      },
    },
  ]
};

describe('CSidebar', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Set up router mock with proper route
    router.currentRoute.value = {
      path: '/main',
      name: 'Main Page',
      meta: {
        title: 'Dashboard',
        icon: MockIcon,
        sidebar: true,
      },
      matched: [
        {
          path: '/main',
          name: 'Main Page',
          meta: {
            title: 'Dashboard',
            icon: MockIcon,
            sidebar: true,
          },
        },
      ],
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render the sidebar with navigation', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      expect(wrapper.find('aside').exists()).toBe(true);
      expect(wrapper.find('nav').exists()).toBe(true);
      expect(wrapper.find('h2').text()).toBe('Main Navigation');
    });

    it('should initialize with visible state', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      expect(wrapper.vm.isVisible).toBe(true);
    });

    it('should render screen reader heading', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const heading = wrapper.find('h2.sr-only');
      expect(heading.exists()).toBe(true);
      expect(heading.text()).toBe('Main Navigation');
    });
  });

  describe('Component Logic', () => {
    it('should map routes to menu items correctly', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      expect(component.topLevelMenus).toBeDefined();
      expect(Array.isArray(component.topLevelMenus)).toBe(true);
    });

    it('should filter routes correctly', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      const menuNames = component.topLevelMenus.map((menu: any) => menu.name);
      
      expect(menuNames).toContain('Main Page');
      expect(menuNames).toContain('Admins');
      expect(menuNames).toContain('Students');
      expect(menuNames).toContain('Dormitories');
      expect(menuNames).toContain('Payments');
      expect(menuNames).toContain('Messages');
      expect(menuNames).not.toContain('Settings');
    });

    it('should detect submenu activity correctly', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      expect(typeof component.isSubmenuActive).toBe('function');
    });

    it('should highlight submenu items correctly', () => {
      router.currentRoute.value = {
        path: '/rooms',
        name: 'Rooms',
        meta: {
          title: 'Rooms',
          icon: MockIcon,
          sidebar: true,
          parent: 'Dormitories',
        },
        matched: [
          {
            path: '/rooms',
            name: 'Rooms',
            meta: {
              title: 'Rooms',
              icon: MockIcon,
              sidebar: true,
              parent: 'Dormitories',
            },
          },
        ],
      };

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      const roomsSubmenu = {
        name: 'Rooms',
        path: '/rooms',
        meta: { title: 'Rooms', icon: MockIcon, sidebar: true, parent: 'Dormitories' }
      };
      
      const isHighlighted = component.isSubmenuHighlighted(roomsSubmenu);
      expect(isHighlighted).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const aside = wrapper.find('aside');
      expect(aside.classes()).toContain('lg:static');
      expect(aside.classes()).toContain('lg:w-64');
    });

    it('should have proper z-index for layering', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const aside = wrapper.find('aside');
      expect(aside.classes()).toContain('z-10');
    });
  });

  describe('Component Exposure', () => {
    it('should expose necessary methods and properties', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      expect(component.isVisible).toBeDefined();
      expect(component.topLevelMenus).toBeDefined();
      expect(typeof component.isSubmenuActive).toBe('function');
      expect(typeof component.isSubmenuHighlighted).toBe('function');
    });
  });
}); 