import { test, expect } from '@playwright/test';

test('Check API response for admin ID 16', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:5173/');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Login
  await page.fill('input[type="email"]', 'admin@email.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  await page.waitForURL('/main');
  
  // Make a direct API call to check the response
  const response = await page.evaluate(async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return await res.json();
  });
  
  console.log('API Response:', JSON.stringify(response, null, 2));
  
  // Check if dormitory_id is present
  expect(response).toHaveProperty('dormitory_id');
  console.log('dormitory_id value:', response.dormitory_id);
  console.log('dormitory value:', response.dormitory);
}); 