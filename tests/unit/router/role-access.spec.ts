import { describe, it, expect } from 'vitest';
import router from '@/router';

describe('Router Role-Based Access', () => {
  describe('Admin Routes', () => {
    it('should have /admins route with correct role configuration', () => {
      const adminsRoute = router.options.routes.find(route => route.path === '/admins');
      
      expect(adminsRoute).toBeDefined();
      expect(adminsRoute?.meta?.title).toBe('Admins');
      expect(adminsRoute?.meta?.sidebar).toBe(true);
      expect(adminsRoute?.meta?.roles).toEqual(['sudo']);
    });

    it('should have /admin-form route with correct role configuration', () => {
      const adminFormRoute = router.options.routes.find(route => route.path === '/admin-form/:id?');
      
      expect(adminFormRoute).toBeDefined();
      expect(adminFormRoute?.meta?.title).toBe('Admin Form');
      expect(adminFormRoute?.meta?.sidebar).toBe(true);
      expect(adminFormRoute?.meta?.parent).toBe('Admins');
      expect(adminFormRoute?.meta?.roles).toEqual(['sudo', 'admin']);
    });
  });

  describe('Student Routes', () => {
    it('should have /students route with correct role configuration', () => {
      const studentsRoute = router.options.routes.find(route => route.path === '/students');
      
      expect(studentsRoute).toBeDefined();
      expect(studentsRoute?.meta?.title).toBe('Students');
      expect(studentsRoute?.meta?.sidebar).toBe(true);
      expect(studentsRoute?.meta?.roles).toEqual(['admin']);
    });

    it('should have /student-form route with correct role configuration', () => {
      const studentFormRoute = router.options.routes.find(route => route.path === '/student-form/:id?');
      
      expect(studentFormRoute).toBeDefined();
      expect(studentFormRoute?.meta?.title).toBe('Student Form');
      expect(studentFormRoute?.meta?.sidebar).toBe(true);
      expect(studentFormRoute?.meta?.parent).toBe('Students');
      expect(studentFormRoute?.meta?.roles).toEqual(['sudo', 'admin', 'student']);
    });
  });

  describe('Role Access Patterns', () => {
    it('should allow sudo users to access only admin routes, not student routes', () => {
      const adminsRoute = router.options.routes.find(route => route.path === '/admins');
      const studentsRoute = router.options.routes.find(route => route.path === '/students');
      
      expect(adminsRoute?.meta?.roles).toContain('sudo');
      expect(studentsRoute?.meta?.roles).not.toContain('sudo');
    });

    it('should allow admin users to access student routes but not admin routes', () => {
      const adminsRoute = router.options.routes.find(route => route.path === '/admins');
      const studentsRoute = router.options.routes.find(route => route.path === '/students');
      
      expect(adminsRoute?.meta?.roles).not.toContain('admin');
      expect(studentsRoute?.meta?.roles).toContain('admin');
    });

    it('should not allow student users to access admin routes', () => {
      const adminsRoute = router.options.routes.find(route => route.path === '/admins');
      
      expect(adminsRoute?.meta?.roles).not.toContain('student');
    });

    it('should not allow guest users to access admin or student routes', () => {
      const adminsRoute = router.options.routes.find(route => route.path === '/admins');
      const studentsRoute = router.options.routes.find(route => route.path === '/students');
      
      expect(adminsRoute?.meta?.roles).not.toContain('guest');
      expect(studentsRoute?.meta?.roles).not.toContain('guest');
    });
  });

  describe('Sidebar Menu Structure', () => {
    it('should have sidebar-enabled routes for main navigation', () => {
      const sidebarRoutes = router.options.routes.filter(route => route.meta?.sidebar === true);
      
      expect(sidebarRoutes.length).toBeGreaterThan(0);
      
      // Check for key routes
      const routePaths = sidebarRoutes.map(route => route.path);
      expect(routePaths).toContain('/main');
      expect(routePaths).toContain('/admins');
      expect(routePaths).toContain('/students');
    });

    it('should have proper parent-child relationships for forms', () => {
      const adminFormRoute = router.options.routes.find(route => route.path === '/admin-form/:id?');
      const studentFormRoute = router.options.routes.find(route => route.path === '/student-form/:id?');
      
      expect(adminFormRoute?.meta?.parent).toBe('Admins');
      expect(studentFormRoute?.meta?.parent).toBe('Students');
    });
  });
}); 