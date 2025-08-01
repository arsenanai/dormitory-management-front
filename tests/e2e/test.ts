import { test as base, expect } from '@playwright/test';

// Export the base test without API mocking
export const test = base;
export { expect };