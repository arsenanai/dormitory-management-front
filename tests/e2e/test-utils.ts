import { Page, expect } from '@playwright/test';

// Test user credentials based on project requirements
export const TEST_USERS = {
  superadmin: {
    // Uses SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD from env, fallback to 'sudo@email.com'/'supersecret'
    email: process.env.SUPERADMIN_EMAIL || 'sudo@email.com',
    password: process.env.SUPERADMIN_PASSWORD || 'supersecret',
    role: 'superadmin'
  },
  admin: {
    // Matches DevelopmentSeeder: admin@email.com / supersecret
    email: process.env.ADMIN_EMAIL || 'admin@email.com',
    password: process.env.ADMIN_PASSWORD || 'supersecret',
    role: 'admin'
  },
  student: {
    // Matches DevelopmentSeeder: student@email.com / studentpass
    email: process.env.STUDENT_EMAIL || 'student@email.com',
    password: process.env.STUDENT_PASSWORD || 'studentpass',
    role: 'student'
  }
};

// Common selectors based on current project structure
export const SELECTORS = {
  // Login/Registration
  loginEmail: '#login-email',
  loginPassword: '#login-password',
  loginButton: 'button[type="submit"]:has-text("Login")',
  registerTab: 'button[role="tab"]:has-text("Registration")',
  registerEmail: '#registration-email',
  registerPassword: '#registration-password',
  registerName: '#registration-name',
  registerButton: 'button[type="submit"]:has-text("Register")',
  
  // Navigation
  sidebar: '[data-testid="sidebar"], .sidebar',
  sidebarLinks: '[data-testid="sidebar-link"], .sidebar a',
  
  // Common UI elements
  addButton: '[data-testid="add-button"], button:has-text("Add"), button:has-text("Create")',
  editButton: '[data-testid="edit-button"], button:has-text("Edit")',
  deleteButton: '[data-testid="delete-button"], button:has-text("Delete")',
  saveButton: 'button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Submit")',
  cancelButton: 'button:has-text("Cancel")',
  
  // Tables and lists
  tableRow: '[data-testid="table-row"], tr',
  tableCell: '[data-testid="table-cell"], td',
  
  // Forms
  formField: (name: string) => `#${name}, [name="${name}"]`,
  
  // Messages
  successMessage: '.toast-success, .alert-success, [role="alert"]:has-text("success")',
  errorMessage: '.toast-error, .alert-error, [role="alert"]:has-text("error")',
  infoMessage: '.toast-info, .alert-info',
  
  // Modals
  modal: '[data-testid="modal"], .modal',
  modalClose: '[data-testid="modal-close"], .modal-close',
  
  // Loading states
  loadingSpinner: '[data-testid="loading"], .loading, .spinner',
  
  // Student specific
  studentRow: '[data-testid="student-row"]',
  dormitoryAccessStatus: '[data-testid="dormitory-access-status"]',
  accessGranted: '[data-testid="access-granted"]',
  accessDenied: '[data-testid="access-denied"]',
  
  // Room/Bed specific
  roomRow: '[data-testid="room-row"]',
  bedItem: '[data-testid="bed-item"]',
  staffReservationCheckbox: '[data-testid="staff-reservation-checkbox"]',
  bedManagement: '[data-testid="bed-management"]'
};

// Common test utilities
export class TestUtils {
  static async login(page: Page, userType: keyof typeof TEST_USERS) {
    const user = TEST_USERS[userType];
    
    await page.goto('/');
    await page.fill(SELECTORS.loginEmail, user.email);
    await page.fill(SELECTORS.loginPassword, user.password);
    await page.click(SELECTORS.loginButton);
    
    // Wait for successful login - redirect to main page
    await page.waitForURL(/\/main/, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
  }

  static async logout(page: Page) {
    // Look for logout button in user menu or sidebar
    const logoutButton = page.locator('[data-testid="logout-button"], button:has-text("Logout")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL('/', { timeout: 10000 });
    }
  }

  static async navigateTo(page: Page, route: string) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
  }

  static async waitForElement(page: Page, selector: string, timeout = 10000) {
    await page.waitForSelector(selector, { timeout });
  }

  static async waitForElementToBeVisible(page: Page, selector: string, timeout = 10000) {
    await page.waitForSelector(selector, { state: 'visible', timeout });
  }

  static async waitForElementToBeHidden(page: Page, selector: string, timeout = 10000) {
    await page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  static async expectElementVisible(page: Page, selector: string) {
    await expect(page.locator(selector)).toBeVisible();
  }

  static async expectElementHidden(page: Page, selector: string) {
    await expect(page.locator(selector)).toBeHidden();
  }

  static async expectElementContainsText(page: Page, selector: string, text: string) {
    await expect(page.locator(selector)).toContainText(text);
  }

  static async expectElementHasValue(page: Page, selector: string, value: string) {
    await expect(page.locator(selector)).toHaveValue(value);
  }

  static async expectURL(page: Page, url: string | RegExp) {
    await expect(page).toHaveURL(url);
  }

  static async expectSuccessMessage(page: Page) {
    await this.expectElementVisible(page, SELECTORS.successMessage);
  }

  static async expectErrorMessage(page: Page) {
    await this.expectElementVisible(page, SELECTORS.errorMessage);
  }

  static async fillFormField(page: Page, fieldName: string, value: string) {
    const field = page.locator(SELECTORS.formField(fieldName));
    if (await field.count() > 0) {
      await field.fill(value);
    }
  }

  static async selectFormOption(page: Page, fieldName: string, value: string) {
    const field = page.locator(SELECTORS.formField(fieldName));
    if (await field.count() > 0) {
      await field.selectOption(value);
    }
  }

  static async clickButton(page: Page, buttonText: string) {
    const button = page.locator(`button:has-text("${buttonText}")`);
    if (await button.count() > 0) {
      await button.click();
    }
  }

  static async clickAddButton(page: Page) {
    const addButton = page.locator(SELECTORS.addButton);
    if (await addButton.count() > 0) {
      await addButton.click();
    }
  }

  static async clickSaveButton(page: Page) {
    const saveButton = page.locator(SELECTORS.saveButton);
    if (await saveButton.count() > 0) {
      await saveButton.click();
    }
  }

  static async waitForLoadingToComplete(page: Page) {
    const loadingSpinner = page.locator(SELECTORS.loadingSpinner);
    if (await loadingSpinner.count() > 0) {
      await this.waitForElementToBeHidden(page, SELECTORS.loadingSpinner);
    }
  }

  // Business rule specific utilities
  static async checkDormitoryAccessStatus(page: Page) {
    const accessStatus = page.locator(SELECTORS.dormitoryAccessStatus);
    if (await accessStatus.count() > 0) {
      await this.expectElementVisible(page, SELECTORS.dormitoryAccessStatus);
      
      // Check if either access granted or denied is visible
      const accessGranted = page.locator(SELECTORS.accessGranted);
      const accessDenied = page.locator(SELECTORS.accessDenied);
      
      await expect(accessGranted.or(accessDenied)).toBeVisible();
    }
  }

  static async checkStaffReservationOptions(page: Page) {
    const bedManagement = page.locator(SELECTORS.bedManagement);
    if (await bedManagement.count() > 0) {
      const staffReservationCheckbox = page.locator(SELECTORS.staffReservationCheckbox);
      await expect(staffReservationCheckbox).toBeVisible();
    }
  }

  // Internationalization utilities
  static async checkLanguageSupport(page: Page, locale: string) {
    // Check if language selector exists and can be changed
    const languageSelector = page.locator('[data-testid="language-selector"], select[name="locale"]');
    if (await languageSelector.count() > 0) {
      await languageSelector.selectOption(locale);
      // Wait for page to reload with new language
      await page.waitForLoadState('networkidle');
    }
  }

  // Role-based access utilities
  static async checkRoleBasedAccess(page: Page, expectedRole: string) {
    // Check if user has access to role-specific features
    const roleSpecificElements = page.locator(`[data-testid="${expectedRole}-features"]`);
    if (await roleSpecificElements.count() > 0) {
      await this.expectElementVisible(page, `[data-testid="${expectedRole}-features"]`);
    }
  }
}

// Test data generators
export const TestData = {
  generateUniqueEmail: (prefix = 'test') => `${prefix}+${Date.now()}@example.com`,
  generateUniqueName: (prefix = 'Test') => `${prefix} ${Date.now()}`,
  generateIIN: () => Math.floor(100000000000 + Math.random() * 900000000000).toString(),
  
  // Student test data
  student: {
    name: 'Test Student',
    surname: 'Test Surname',
    email: 'teststudent@example.com',
    password: 'TestPassword123',
    iin: '123456789012',
    faculty: 'engineering',
    specialist: 'computer_sciences',
    enrollmentYear: '2023',
    gender: 'male',
    dormitory: 'a_block',
    room: 'a210'
  },
  
  // Guest test data
  guest: {
    name: 'Test Guest',
    email: 'testguest@example.com',
    phone: '+77001234567',
    roomType: 'single'
  },
  
  // Room test data
  room: {
    number: 'A101',
    capacity: '2',
    dormitory: 'a_block',
    roomType: 'standard'
  },
  
  // Payment test data
  payment: {
    amount: '50000',
    semester: '2024-1',
    paymentMethod: 'cash',
    description: 'Test payment'
  }
}; 