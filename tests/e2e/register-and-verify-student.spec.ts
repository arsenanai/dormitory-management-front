import { test, expect } from './test';

// E2E: student registers on login page; admin verifies in Students index

test('Student registers; admin verifies student appears in Students page', async ({ page, request }) => {
  console.log('🧪 Starting E2E test: Student registration and admin verification');

  // Listen to console messages from the page
  page.on('console', (msg) => {
    if (msg.type() === 'log' || msg.type() === 'error') {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    }
  });

  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');

  // 2) Login as admin
  await page.goto('http://localhost:3000/'); // Go back to login page
  await page.waitForLoadState('networkidle');

  // Wait for login form to be visible
  await expect(page.locator('#login-email')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#login-password')).toBeVisible({ timeout: 10000 });

  await page.fill('#login-email', process.env.ADMIN_EMAIL || 'admin@email.com');
  await page.fill('#login-password', process.env.ADMIN_PASSWORD || 'supersecret');
  await page.click('button[type="submit"]:has-text("Login")');
  await page.waitForURL(/\/(main|dashboard)/, { timeout: 15000 });
  console.log('🔐 Logged in as admin');

  // Read profile via browser fetch to get dormitory_id
  const dormitoryId = await page.evaluate(async () => {
    const res = await fetch('http://localhost:8000/api/users/profile', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    return (data && data.dormitory_id) || (data?.dormitory?.id) || null;
  });
  expect(dormitoryId, 'Admin dormitory_id must be available').not.toBeNull();

  // Logout by clearing token and go back to login
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');

  // 2) Registration tab and register student into admin dormitory
  await page.locator('[data-testid="tab-registration"]').click();
  await page.waitForLoadState('networkidle');

  const uniqueSuffix = Date.now();
  const uniqueEmail = `e2e.student+${uniqueSuffix}@example.com`;
  const uniqueName = `E2E Student ${uniqueSuffix}`;
  const uniqueIin = ('' + (uniqueSuffix % 1_000_000_000_000)).padStart(12, '0');

  // Fill form
  await page.fill('#registration-iin', uniqueIin);
  await page.fill('#registration-name', uniqueName);
  await page.fill('#registration-faculty', 'CompSci');
  await page.fill('#registration-specialist', 'SE');
  await page.fill('#registration-enrollment-year', '2024');
  await page.selectOption('#registration-gender', 'male');
  await page.fill('#registration-email', uniqueEmail);
  await page.fill('#registration-password', 'password123');
  await page.fill('#registration-confirm-password', 'password123');

  // Select admin's dormitory
  await page.selectOption('#registration-dormitory', String(dormitoryId));
  await page.waitForTimeout(1200);

  const roomOptions = page.locator('#registration-room option:not([value=""])');
  const roomCount = await roomOptions.count();
  expect(roomCount).toBeGreaterThan(0);
  const firstRoomValue = await roomOptions.first().getAttribute('value');
  await page.selectOption('#registration-room', firstRoomValue!);

  // Upload test files
  const testFile1Path = './tests/e2e/assets/test-document-1.pdf';
  const testFile2Path = './tests/e2e/assets/test-document-2.pdf';

  // Debug: Check what file input elements exist
  console.log('🔍 Checking file input elements...');
  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  console.log(`Found ${count} file input elements`);

  for (let i = 0; i < count; i++) {
    const id = await fileInputs.nth(i).getAttribute('id');
    const name = await fileInputs.nth(i).getAttribute('name');
    console.log(`File input ${i}: id="${id}", name="${name}"`);
  }

  // Set files directly on the hidden inputs (this will update the v-model)
  await page.locator('#registration-file-0').setInputFiles(testFile1Path);
  await page.waitForTimeout(500);
  await page.locator('#registration-file-1').setInputFiles(testFile2Path);
  await page.waitForTimeout(500);

  console.log('✅ Uploaded test PDF files programmatically');

  // Agree rules and submit
  await page.check('#registration-agree-rules');
  await page.click('button[type="submit"]:has-text("Register")');
  await page.waitForTimeout(2000);

  // 3) Login again as admin
  await page.goto('http://localhost:3000/'); // Go back to login page
  await page.waitForLoadState('networkidle');

  // Wait for login form to be visible
  await expect(page.locator('#login-email')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#login-password')).toBeVisible({ timeout: 10000 });

  await page.fill('#login-email', process.env.ADMIN_EMAIL || 'admin@email.com');
  await page.fill('#login-password', process.env.ADMIN_PASSWORD || 'supersecret');
  await page.click('button[type="submit"]:has-text("Login")');
  await page.waitForURL(/\/(main|dashboard)/, { timeout: 15000 });
  console.log('�� Logged in as admin again');

  // 4) Navigate to Students page via sidebar
  const sidebar = page.locator('nav[aria-label="Main sidebar navigation"]');
  await expect(sidebar).toBeVisible({ timeout: 15000 });
  const studentsLink = sidebar.getByRole('link', { name: /students/i });
  await expect(studentsLink).toBeVisible({ timeout: 15000 });
  await studentsLink.click();
  await page.waitForURL(/\/students$/, { timeout: 15000 });
  console.log('✅ Navigated to Students page');

  // Debug: Check what's actually on the page
  console.log('🔍 Debugging Students page...');
  
  // Wait for search input and table to be visible
  const search = page.locator('#search-input');
  await expect(search).toBeVisible({ timeout: 15000 });
  const table = page.locator('[data-testid="students-table"]');
  await expect(table).toBeVisible({ timeout: 15000 });
  await table.scrollIntoViewIfNeeded();
  console.log('✅ Students table and search input visible');

  // Debug: Check table content
  const tableRows = table.locator('tbody tr');
  const rowCount = await tableRows.count();
  console.log(`📊 Table has ${rowCount} rows`);
  
  // Debug: Check the actual HTML structure
  const tableHTML = await table.innerHTML();
  console.log('🔍 Table HTML structure:', tableHTML.substring(0, 500) + '...');
  
  if (rowCount > 0) {
    // Check if the first row has the expected structure
    const firstRow = tableRows.first();
    const firstRowHTML = await firstRow.innerHTML();
    console.log('🔍 First row HTML:', firstRowHTML.substring(0, 300) + '...');
    
    // Try to find any text content in the first row
    const firstRowText = await firstRow.textContent();
    console.log('🔍 First row text content:', firstRowText);
    
    // Check if there are any td elements
    const tdElements = firstRow.locator('td');
    const tdCount = await tdElements.count();
    console.log(`🔍 First row has ${tdCount} td elements`);
    
    if (tdCount > 0) {
      for (let i = 0; i < Math.min(tdCount, 3); i++) {
        const td = tdElements.nth(i);
        const tdText = await td.textContent();
        console.log(`🔍 TD ${i + 1}: "${tdText}"`);
      }
    }
  }

  // Debug: Check if the student exists in the table before filtering
  const studentExistsBeforeFilter = await table.getByText(uniqueName).count();
  console.log(`🔍 Student "${uniqueName}" found ${studentExistsBeforeFilter} times before filtering`);

  // Filter via search to target the new student
  await search.fill(uniqueName);
  await page.waitForTimeout(2000); // Wait for filter to apply
  console.log(`🔍 Applied search filter for: "${uniqueName}"`);

  // Debug: Check table content after filtering
  const filteredRows = table.locator('tbody tr');
  const filteredRowCount = await filteredRows.count();
  console.log(`📊 Table has ${filteredRowCount} rows after filtering`);
  
  if (filteredRowCount > 0) {
    for (let i = 0; i < Math.min(filteredRowCount, 3); i++) {
      const row = filteredRows.nth(i);
      const nameCell = row.locator('td').nth(1); // Name column
      const nameText = await nameCell.textContent();
      console.log(`Filtered Row ${i + 1}: "${nameText}"`);
    }
  }

  // Assert by name within table
  await expect(table.getByText(uniqueName)).toBeVisible({ timeout: 20000 });
  console.log(`✅ Student "${uniqueName}" found in the table`);
});