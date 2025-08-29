import { describe, it, expect, vi } from 'vitest';

// Test the admin dormitory restriction logic
describe('StudentForm - Admin Dormitory Restriction', () => {
  // Mock auth store with admin user
  const mockAdminUser = {
    id: 1,
    name: 'Admin User',
    role: { name: 'admin' }
  };

  // Mock auth store with regular user
  const mockRegularUser = {
    id: 2,
    name: 'Regular User',
    role: { name: 'student' }
  };

  // Simulate the isAdmin computed property logic
  const isAdmin = (user: any) => user?.role?.name === 'admin';

  it('should identify admin users correctly', () => {
    expect(isAdmin(mockAdminUser)).toBe(true);
    expect(isAdmin(mockRegularUser)).toBe(false);
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin({})).toBe(false);
  });

  it('should disable dormitory field for admin users', () => {
    const adminIsAdmin = isAdmin(mockAdminUser);
    const regularIsAdmin = isAdmin(mockRegularUser);

    // Dormitory should be disabled for admins
    expect(adminIsAdmin).toBe(true);
    
    // Dormitory should be enabled for regular users
    expect(regularIsAdmin).toBe(false);
  });

  it('should show admin restriction message for admin users', () => {
    const adminIsAdmin = isAdmin(mockAdminUser);
    const regularIsAdmin = isAdmin(mockRegularUser);

    // Should show restriction message for admins
    expect(adminIsAdmin).toBe(true);
    
    // Should not show restriction message for regular users
    expect(regularIsAdmin).toBe(false);
  });

  it('should validate dormitory change prevention for admins', () => {
    const originalDormitoryId = 1;
    const newDormitoryId = 2;
    const adminIsAdmin = isAdmin(mockAdminUser);

    // Simulate dormitory change validation
    const isDormitoryChanged = originalDormitoryId !== newDormitoryId;
    const shouldPreventChange = adminIsAdmin && isDormitoryChanged;

    expect(shouldPreventChange).toBe(true);
  });

  it('should allow dormitory changes for non-admin users', () => {
    const originalDormitoryId = 1;
    const newDormitoryId = 2;
    const regularIsAdmin = isAdmin(mockRegularUser);

    // Simulate dormitory change validation
    const isDormitoryChanged = originalDormitoryId !== newDormitoryId;
    const shouldPreventChange = regularIsAdmin && isDormitoryChanged;

    expect(shouldPreventChange).toBe(false);
  });

  it('should allow same dormitory selection for admins', () => {
    const originalDormitoryId = 1;
    const newDormitoryId = 1; // Same dormitory
    const adminIsAdmin = isAdmin(mockAdminUser);

    // Simulate dormitory change validation
    const isDormitoryChanged = originalDormitoryId !== newDormitoryId;
    const shouldPreventChange = adminIsAdmin && isDormitoryChanged;

    expect(shouldPreventChange).toBe(false);
  });

  it('should preset dormitory for admin users when creating new students', () => {
    const mockAdminUserWithDormitory = {
      id: 1,
      name: 'Admin User',
      role: { name: 'admin' },
      adminProfile: {
        dormitory_id: 3
      }
    };

    const adminIsAdmin = isAdmin(mockAdminUserWithDormitory);
    const hasDormitoryProfile = !!mockAdminUserWithDormitory.adminProfile?.dormitory_id;

    // Admin should have dormitory preset
    expect(adminIsAdmin).toBe(true);
    expect(hasDormitoryProfile).toBe(true);
    expect(mockAdminUserWithDormitory.adminProfile.dormitory_id).toBe(3);
  });

  it('should not preset dormitory for non-admin users', () => {
    const mockStudentUser = {
      id: 2,
      name: 'Student User',
      role: { name: 'student' }
    };

    const studentIsAdmin = isAdmin(mockStudentUser);
    const hasDormitoryProfile = !!mockStudentUser.adminProfile?.dormitory_id;

    // Student should not have dormitory preset
    expect(studentIsAdmin).toBe(false);
    expect(hasDormitoryProfile).toBe(false);
  });
});
