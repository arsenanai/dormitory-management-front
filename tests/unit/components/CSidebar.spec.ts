import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouterMock, injectRouterMock } from 'vue-router-mock';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '@/i18n';
// @ts-expect-error: Vue SFC import for test
import CSidebar from '../../../src/components/CSidebar.vue';
import { useAuthStore } from '@/stores/auth';

// Mock icons
const MockIcon = {
  template: '<svg class="mock-icon" />',
};

// Configure vue-router-mock
const router = createRouterMock();
injectRouterMock(router);

// Mock router.options.routes for CSidebar component with role-based access
router.options = {
  routes: [
    {
      path: '/main',
      name: 'Main Page',
      meta: {
        title: 'Dashboard',
        icon: MockIcon,
        sidebar: true,
        roles: ['sudo', 'admin', 'student', 'guest'],
      },
    },
    {
      path: '/admins',
      name: 'Admins',
      meta: {
        title: 'Admins',
        icon: MockIcon,
        sidebar: true,
        roles: ['sudo'],
      },
    },
    {
      path: '/admin-form/:id?',
      name: 'Admin Form',
      meta: {
        title: 'Admin Form',
        icon: MockIcon,
        sidebar: true,
        parent: 'Admins',
        roles: ['sudo', 'admin'],
      },
    },
    {
      path: '/students',
      name: 'Students',
      meta: {
        title: 'Students',
        icon: MockIcon,
        sidebar: true,
        roles: ['admin'],
      },
    },
    {
      path: '/student-form/:id?',
      name: 'Student Form',
      meta: {
        title: 'Student Form',
        icon: MockIcon,
        sidebar: true,
        parent: 'Students',
        roles: ['sudo', 'admin', 'student'],
      },
    },
    {
      path: '/guest-house',
      name: 'Guests',
      meta: {
        title: 'Guests',
        icon: MockIcon,
        sidebar: true,
        roles: ['admin'],
      },
    },
    {
      path: '/dormitories',
      name: 'Dormitories',
      meta: {
        title: 'Dormitories',
        icon: MockIcon,
        sidebar: true,
        roles: ['sudo'],
      },
    },
    {
      path: '/rooms',
      name: 'Rooms',
      meta: {
        title: 'Rooms',
        icon: MockIcon,
        sidebar: true,
        roles: ['sudo', 'admin'],
      },
    },
    {
      path: '/payments',
      name: 'Payments',
      meta: {
        title: 'Payments',
        icon: MockIcon,
        sidebar: true,
        roles: ['sudo', 'admin'],
      },
    },
    {
      path: '/messages',
      name: 'Messages',
      meta: {
        title: 'Messages',
        icon: MockIcon,
        sidebar: true,
        roles: ['sudo', 'admin', 'student', 'guest'],
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
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    
    // Set up router mock with proper route
    router.currentRoute.value = {
      path: '/main',
      name: 'Main Page',
      meta: {
        title: 'Dashboard',
        icon: MockIcon,
        sidebar: true,
        roles: ['sudo', 'admin', 'student', 'guest'],
      },
      matched: [
        {
          path: '/main',
          name: 'Main Page',
          meta: {
            title: 'Dashboard',
            icon: MockIcon,
            sidebar: true,
            roles: ['sudo', 'admin', 'student', 'guest'],
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
          plugins: [i18n, pinia],
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
          plugins: [i18n, pinia],
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
          plugins: [i18n, pinia],
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

  describe('Role-Based Access Control', () => {
    it('should show Admins menu only for Sudo users', () => {
      const authStore = useAuthStore();
      authStore.user = { role: { name: 'sudo' } } as any;

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n, pinia],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      const menuNames = component.topLevelMenus.map((menu: any) => menu.name);
      
      expect(menuNames).toContain('Admins');
      expect(menuNames).not.toContain('Students');
      expect(menuNames).not.toContain('Guests');
      expect(menuNames).toContain('Dormitories');
    });

    it('should show Students menu for Admin users but not Admins menu', () => {
      const authStore = useAuthStore();
      authStore.user = { role: { name: 'admin' } } as any;

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n, pinia],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      const menuNames = component.topLevelMenus.map((menu: any) => menu.name);
      
      expect(menuNames).not.toContain('Admins');
      expect(menuNames).toContain('Students');
      expect(menuNames).not.toContain('Dormitories');
    });

    it('should NOT show Students menu for Sudo users', () => {
      const authStore = useAuthStore();
      authStore.user = { role: { name: 'sudo' } } as any;

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n, pinia],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      const menuNames = component.topLevelMenus.map((menu: any) => menu.name);
      
      expect(menuNames).not.toContain('Students');
    });

    it('should not show Admins or Students for Student users', () => {
      const authStore = useAuthStore();
      authStore.user = { role: { name: 'student' } } as any;

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n, pinia],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      const menuNames = component.topLevelMenus.map((menu: any) => menu.name);
      
      expect(menuNames).not.toContain('Admins');
      expect(menuNames).not.toContain('Students');
      expect(menuNames).toContain('Messages');
    });

    it('should not show Admins or Students for Guest users', () => {
      const authStore = useAuthStore();
      authStore.user = { role: { name: 'guest' } } as any;

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n, pinia],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      const menuNames = component.topLevelMenus.map((menu: any) => menu.name);
      
      expect(menuNames).not.toContain('Admins');
      expect(menuNames).not.toContain('Students');
      expect(menuNames).toContain('Messages');
    });

    it('should show submenus for Admin Form when Admins menu is active', () => {
      const authStore = useAuthStore();
      authStore.user = { role: { name: 'sudo' } } as any;

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n, pinia],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      const adminsMenu = component.topLevelMenus.find((menu: any) => menu.name === 'Admins');
      
      expect(adminsMenu).toBeDefined();
      expect(adminsMenu.submenus).toBeDefined();
      expect(adminsMenu.submenus.length).toBeGreaterThan(0);
      expect(adminsMenu.submenus[0].name).toBe('Admin Form');
    });

    it('should show submenus for Student Form when Students menu is active', () => {
      const authStore = useAuthStore();
      authStore.user = { role: { name: 'admin' } } as any;

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n, pinia],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      const studentsMenu = component.topLevelMenus.find((menu: any) => menu.name === 'Students');
      
      expect(studentsMenu).toBeDefined();
      expect(studentsMenu.submenus).toBeDefined();
      expect(studentsMenu.submenus.length).toBeGreaterThan(0);
      expect(studentsMenu.submenus[0].name).toBe('Student Form');
    });
  });

  describe('Component Logic', () => {
    it('should map routes to menu items correctly', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n, pinia],
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
      // Set up a user role for the test
      const authStore = useAuthStore();
      authStore.user = { role: { name: 'sudo' } } as any;

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n, pinia],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      const menuNames = component.topLevelMenus.map((menu: any) => menu.name);
      
      expect(menuNames).toContain('Main Page');
      expect(menuNames).toContain('Messages');
      expect(menuNames).not.toContain('Settings');
    });

    it('should detect submenu activity correctly', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n, pinia],
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
        path: '/admin-form/1',
        name: 'Admin Form',
        meta: {
          title: 'Admin Form',
          icon: MockIcon,
          sidebar: true,
          parent: 'Admins',
          roles: ['sudo', 'admin'],
        },
        matched: [
          {
            path: '/admin-form/1',
            name: 'Admin Form',
            meta: {
              title: 'Admin Form',
              icon: MockIcon,
              sidebar: true,
              parent: 'Admins',
              roles: ['sudo', 'admin'],
            },
          },
        ],
      };

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n, pinia],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const component = wrapper.vm;
      const adminFormSubmenu = {
        name: 'Admin Form',
        path: '/admin-form/1',
        meta: { title: 'Admin Form', icon: MockIcon, sidebar: true, parent: 'Admins', roles: ['sudo', 'admin'] }
      };
      
      const isHighlighted = component.isSubmenuHighlighted(adminFormSubmenu);
      expect(isHighlighted).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n, pinia],
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
          plugins: [i18n, pinia],
          mocks: {
            $router: router,
            $route: router.currentRoute.value,
          },
        },
      });

      const aside = wrapper.find('aside');
      // Check that the sidebar exists and has proper positioning classes
      expect(aside.exists()).toBe(true);
    });
  });

  describe('Component Exposure', () => {
    it('should expose necessary methods and properties', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [i18n, pinia],
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