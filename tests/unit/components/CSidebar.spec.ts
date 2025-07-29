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
      path: '/admin-form/:id?',
      name: 'Admin Form',
      meta: {
        title: 'Admin Form',
        icon: MockIcon,
        sidebar: true,
        parent: 'Admins',
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
      path: '/student-form/:id?',
      name: 'Student Form',
      meta: {
        title: 'Student Form',
        icon: MockIcon,
        sidebar: true,
        parent: 'Students',
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
  ]
};

describe.skip('CSidebar', () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    // Mock the current route
    router.currentRoute = {
      path: '/main',
      name: 'Main Page',
      matched: [
        {
          path: '/main',
          name: 'Main Page',
        },
      ],
    };

    // Mock setCurrentRoute
    router.setCurrentRoute = vi.fn((path: string) => {
      router.currentRoute = {
        path,
        name: path.replace('/', '').replace('-', ' '),
        matched: [
          {
            path,
            name: path.replace('/', '').replace('-', ' '),
          },
        ],
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render the sidebar with navigation', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      expect(wrapper.find('aside').exists()).toBe(true);
      expect(wrapper.find('nav').exists()).toBe(true);
      expect(wrapper.find('nav').attributes('aria-label')).toBe('Main sidebar navigation');
    });

    it('should render only routes with sidebar: true', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Should render top-level menu items
      expect(wrapper.text()).toContain('Dashboard');
      expect(wrapper.text()).toContain('Admins');
      expect(wrapper.text()).toContain('Students');
      expect(wrapper.text()).toContain('Dormitories');
      expect(wrapper.text()).toContain('Payments');
      expect(wrapper.text()).toContain('Messages');
      
      // Should not render routes without sidebar: true
      expect(wrapper.text()).not.toContain('Settings');
    });

    it('should initialize with visible state', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      expect(component.isVisible).toBe(true);
    });

    it('should render screen reader heading', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const srHeading = wrapper.find('h2.sr-only');
      expect(srHeading.exists()).toBe(true);
      expect(srHeading.text()).toBe('Main Navigation');
    });
  });

  describe('Menu Rendering', () => {
    it('should render all top-level menu items', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const menuItems = wrapper.findAll('a[href]');
      expect(menuItems.length).toBeGreaterThan(0);
      
      // Check for expected menu items
      const menuTexts = menuItems.map(item => item.text().trim());
      expect(menuTexts).toContain('Dashboard');
      expect(menuTexts).toContain('Admins');
      expect(menuTexts).toContain('Students');
      expect(menuTexts).toContain('Dormitories');
      expect(menuTexts).toContain('Payments');
      expect(menuTexts).toContain('Messages');
    });

    it('should render menu items with correct links', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const dashboardLink = wrapper.find('a[href="/main"]');
      const adminsLink = wrapper.find('a[href="/admins"]');
      const studentsLink = wrapper.find('a[href="/students"]');

      expect(dashboardLink.exists()).toBe(true);
      expect(adminsLink.exists()).toBe(true);
      expect(studentsLink.exists()).toBe(true);
    });

    it('should render icons for menu items', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const icons = wrapper.findAll('.mock-icon');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Active State Highlighting', () => {
    it('should highlight active menu item', async () => {
      router.setCurrentRoute('/main');

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      await wrapper.vm.$nextTick();

      const activeLink = wrapper.find('a[href="/main"]');
      expect(activeLink.classes()).toContain('bg-primary-100');
      expect(activeLink.classes()).toContain('border-l-secondary-600');
      expect(activeLink.attributes('aria-current')).toBe('page');
    });

    it('should not highlight inactive menu items', async () => {
      router.setCurrentRoute('/main');

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      await wrapper.vm.$nextTick();

      const inactiveLink = wrapper.find('a[href="/admins"]');
      expect(inactiveLink.classes()).not.toContain('bg-primary-100');
      expect(inactiveLink.classes()).not.toContain('border-l-secondary-600');
      expect(inactiveLink.attributes('aria-current')).toBeUndefined();
    });

    it('should update highlighting when route changes', async () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      // Start on main
      router.setCurrentRoute('/main');
      await wrapper.vm.$nextTick();

      let mainLink = wrapper.find('a[href="/main"]');
      expect(mainLink.classes()).toContain('bg-primary-100');

      // Change to admins
      router.setCurrentRoute('/admins');
      await wrapper.vm.$nextTick();

      mainLink = wrapper.find('a[href="/main"]');
      const adminsLink = wrapper.find('a[href="/admins"]');
      
      expect(mainLink.classes()).not.toContain('bg-primary-100');
      expect(adminsLink.classes()).toContain('bg-primary-100');
    });
  });

  describe('Submenu Functionality', () => {
    it('should render submenus when parent menu is active', async () => {
      router.setCurrentRoute('/rooms');

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      await wrapper.vm.$nextTick();

      // Should show submenu items
      expect(wrapper.text()).toContain('Rooms');
      expect(wrapper.text()).toContain('Room Types');
    });

    it('should highlight active submenu item', async () => {
      router.setCurrentRoute('/rooms');

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      await wrapper.vm.$nextTick();

      const activeSubmenuLink = wrapper.find('a[href="/rooms"]');
      expect(activeSubmenuLink.classes()).toContain('bg-primary-100');
      expect(activeSubmenuLink.classes()).toContain('border-l-secondary-600');
      expect(activeSubmenuLink.attributes('aria-current')).toBe('page');
    });

    it('should not show submenus when parent is not active', async () => {
      router.setCurrentRoute('/main');

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      await wrapper.vm.$nextTick();

      // Should not show submenu items when on main
      const submenuContainer = wrapper.find('.mt-2.ml-6');
      expect(submenuContainer.exists()).toBe(false);
    });

    it('should render submenus with correct styling', async () => {
      router.setCurrentRoute('/rooms');

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      await wrapper.vm.$nextTick();

      const submenuContainer = wrapper.find('.mt-2.ml-6');
      expect(submenuContainer.exists()).toBe(true);
      expect(submenuContainer.classes()).toContain('flex');
      expect(submenuContainer.classes()).toContain('flex-col');
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const nav = wrapper.find('nav');
      expect(nav.attributes('aria-label')).toBe('Main sidebar navigation');

      const icons = wrapper.findAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have focus ring styling for keyboard navigation', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const menuLinks = wrapper.findAll('a');
      menuLinks.forEach(link => {
        expect(link.classes()).toContain('focus:ring-3');
        expect(link.classes()).toContain('focus:outline-none');
        expect(link.classes()).toContain('focus:ring-secondary-300');
      });
    });

    it('should have proper hover states', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const menuLinks = wrapper.findAll('a');
      menuLinks.forEach(link => {
        expect(link.classes()).toContain('hover:bg-primary-100');
      });
    });

    it('should have proper transition animations', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const menuLinks = wrapper.findAll('a');
      menuLinks.forEach(link => {
        expect(link.classes()).toContain('transition-all');
        expect(link.classes()).toContain('duration-150');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const aside = wrapper.find('aside');
      expect(aside.classes()).toContain('lg:static');
      expect(aside.classes()).toContain('lg:w-64');
      expect(aside.classes()).toContain('lg:flex-shrink-0');
    });

    it('should have proper z-index for layering', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const aside = wrapper.find('aside');
      expect(aside.classes()).toContain('z-10');
    });
  });

  describe('Component Logic', () => {
    it('should map routes to menu items correctly', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      expect(component.topLevelMenus).toBeDefined();
      expect(Array.isArray(component.topLevelMenus)).toBe(true);
    });

    it('should filter routes correctly', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const topLevelMenus = component.topLevelMenus;
      
      // Should only include routes with sidebar: true and no parent
      const menuNames = topLevelMenus.map((menu: any) => menu.name);
      expect(menuNames).toContain('Main Page');
      expect(menuNames).toContain('Admins');
      expect(menuNames).toContain('Students');
      expect(menuNames).toContain('Dormitories');
      expect(menuNames).toContain('Payments');
      expect(menuNames).toContain('Messages');
      expect(menuNames).not.toContain('Settings');
    });

    it('should detect submenu activity correctly', async () => {
      router.setCurrentRoute('/rooms');

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      await wrapper.vm.$nextTick();

      const component = wrapper.vm as any;
      const dormitoriesMenu = component.topLevelMenus.find((menu: any) => menu.name === 'Dormitories');
      
      expect(dormitoriesMenu.submenus).toBeDefined();
      expect(dormitoriesMenu.submenus.length).toBeGreaterThan(0);
    });

    it('should highlight submenu items correctly', async () => {
      router.setCurrentRoute('/rooms');

      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      await wrapper.vm.$nextTick();

      const component = wrapper.vm as any;
      const roomsSubmenu = component.topLevelMenus
        .find((menu: any) => menu.name === 'Dormitories')
        .submenus.find((submenu: any) => submenu.name === 'Rooms');
      
      const isHighlighted = component.isSubmenuHighlighted(roomsSubmenu);
      expect(isHighlighted).toBe(true);
    });
  });

  describe('Route Watching', () => {
    it('should update menus when route changes', async () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      const initialMenus = [...component.topLevelMenus];

      // Change route
      router.setCurrentRoute('/rooms');
      await wrapper.vm.$nextTick();

      // Menus should be updated
      expect(component.topLevelMenus).toBeDefined();
      expect(component.topLevelMenus.length).toBe(initialMenus.length);
    });
  });

  describe('Component Exposure', () => {
    it('should expose necessary methods and properties', () => {
      const wrapper = mount(CSidebar, {
        global: {
          plugins: [router, i18n],
        },
      });

      const component = wrapper.vm as any;
      
      expect(component.isVisible).toBeDefined();
      expect(component.topLevelMenus).toBeDefined();
      expect(typeof component.isSubmenuActive).toBe('function');
      expect(typeof component.isSubmenuHighlighted).toBe('function');
      expect(typeof component.mapRouteToMenu).toBe('function');
      expect(typeof component.mapSubmenus).toBe('function');
    });
  });
}); 