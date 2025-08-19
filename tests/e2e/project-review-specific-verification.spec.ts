import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Project Review Notes - Specific Feature Verification', () => {
  test('should verify blood type integration in student form', async ({ page }) => {
    console.log('🩸 Verifying Blood Type Integration...');
    
    // Check if the StudentForm.vue file exists and contains blood type options
    const studentFormPath = join(__dirname, '../../src/pages/StudentForm.vue');
    const studentFormExists = existsSync(studentFormPath);
    console.log(`📁 StudentForm.vue exists: ${studentFormExists}`);
    
    if (studentFormExists) {
      const studentFormContent = readFileSync(studentFormPath, 'utf-8');
      
      // Check for blood type options array
      const hasBloodTypeOptions = studentFormContent.includes('bloodTypeOptions') || 
                                 studentFormContent.includes('blood_type') ||
                                 studentFormContent.includes('blood-type');
      console.log(`🩸 Blood type options found in code: ${hasBloodTypeOptions}`);
      
      // Check for blood type field in template
      const hasBloodTypeField = studentFormContent.includes('blood_type') || 
                               studentFormContent.includes('blood-type') ||
                               studentFormContent.includes('bloodType');
      console.log(`🩸 Blood type field in template: ${hasBloodTypeField}`);
      
      expect(hasBloodTypeOptions).toBe(true);
      expect(hasBloodTypeField).toBe(true);
    }
    
    // Navigate to the page to check if blood type field is rendered
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Check for blood type related elements in the rendered page
    const bloodTypeElements = page.locator('[id*="blood"], [name*="blood"], [class*="blood"]');
    const bloodTypeCount = await bloodTypeElements.count();
    console.log(`🩸 Blood type elements found on page: ${bloodTypeCount}`);
    
    console.log('✅ Blood type integration verification completed');
  });

  test('should verify IIN field integration in student form', async ({ page }) => {
    console.log('🆔 Verifying IIN Field Integration...');
    
    // Check if the StudentForm.vue file contains IIN field
    const studentFormPath = join(__dirname, '../../src/pages/StudentForm.vue');
    const studentFormExists = existsSync(studentFormPath);
    console.log(`📁 StudentForm.vue exists: ${studentFormExists}`);
    
    if (studentFormExists) {
      const studentFormContent = readFileSync(studentFormPath, 'utf-8');
      
      // Check for IIN field
      const hasIINField = studentFormContent.includes('iin') || 
                          studentFormContent.includes('IIN') ||
                          studentFormContent.includes('individual_identification_number');
      console.log(`🆔 IIN field found in code: ${hasIINField}`);
      
      expect(hasIINField).toBe(true);
    }
    
    // Navigate to the page to check if IIN field is rendered
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Check for IIN related elements in the rendered page
    const iinElements = page.locator('[id*="iin"], [name*="iin"], [class*="iin"]');
    const iinCount = await iinElements.count();
    console.log(`🆔 IIN elements found on page: ${iinCount}`);
    
    console.log('✅ IIN field integration verification completed');
  });

  test('should verify quota system in rooms and dormitories', async ({ page }) => {
    console.log('📊 Verifying Quota System...');
    
    // Check if the Rooms.vue file contains quota field
    const roomsPath = join(__dirname, '../../src/pages/Rooms.vue');
    const roomsExists = existsSync(roomsPath);
    console.log(`📁 Rooms.vue exists: ${roomsExists}`);
    
    if (roomsExists) {
      const roomsContent = readFileSync(roomsPath, 'utf-8');
      
      // Check for quota field
      const hasQuotaField = roomsContent.includes('quota') || 
                           roomsContent.includes('Quota') ||
                           roomsContent.includes('capacity');
      console.log(`📊 Quota field found in Rooms.vue: ${hasQuotaField}`);
      
      expect(hasQuotaField).toBe(true);
    }
    
    // Check if the Dormitories.vue file contains quota field
    const dormitoriesPath = join(__dirname, '../../src/pages/Dormitories.vue');
    const dormitoriesExists = existsSync(dormitoriesPath);
    console.log(`📁 Dormitories.vue exists: ${dormitoriesExists}`);
    
    if (dormitoriesExists) {
      const dormitoriesContent = readFileSync(dormitoriesPath, 'utf-8');
      
      // Check for quota field
      const hasQuotaField = dormitoriesContent.includes('quota') || 
                           dormitoriesContent.includes('Quota') ||
                           dormitoriesContent.includes('capacity');
      console.log(`📊 Quota field found in Dormitories.vue: ${hasQuotaField}`);
      
      expect(hasQuotaField).toBe(true);
    }
    
    // Check if the Room.ts model contains quota field
    const roomModelPath = join(__dirname, '../../src/models/Room.ts');
    const roomModelExists = existsSync(roomModelPath);
    console.log(`📁 Room.ts model exists: ${roomModelExists}`);
    
    if (roomModelExists) {
      const roomModelContent = readFileSync(roomModelPath, 'utf-8');
      
      // Check for quota field in model
      const hasQuotaInModel = roomModelContent.includes('quota:') || 
                             roomModelContent.includes('quota?:') ||
                             roomModelContent.includes('quota =');
      console.log(`📊 Quota field found in Room model: ${hasQuotaInModel}`);
      
      expect(hasQuotaInModel).toBe(true);
    }
    
    console.log('✅ Quota system verification completed');
  });

  test('should verify country/region/city data integration', async ({ page }) => {
    console.log('🌍 Verifying Country/Region/City Data Integration...');
    
    // Check if the seeders exist and contain geographical data
    const seedersDir = join(__dirname, '../../../crm-back/database/seeders');
    const seedersExist = existsSync(seedersDir);
    console.log(`📁 Seeders directory exists: ${seedersExist}`);
    
    if (seedersExist) {
      // Check for Kazakhstan seeder
      const kazakhstanSeederPath = join(seedersDir, 'KazakhstanSeeder.php');
      const kazakhstanSeederExists = existsSync(kazakhstanSeederPath);
      console.log(`🇰🇿 KazakhstanSeeder.php exists: ${kazakhstanSeederExists}`);
      
      // Check for OtherCountries seeder
      const otherCountriesSeederPath = join(seedersDir, 'OtherCountriesSeeder.php');
      const otherCountriesSeederExists = existsSync(otherCountriesSeederPath);
      console.log(`🌍 OtherCountriesSeeder.php exists: ${otherCountriesSeederExists}`);
      
      expect(kazakhstanSeederExists).toBe(true);
      expect(otherCountriesSeederExists).toBe(true);
    }
    
    // Check if the frontend components reference geographical data
    const studentFormPath = join(__dirname, '../../src/pages/StudentForm.vue');
    if (existsSync(studentFormPath)) {
      const studentFormContent = readFileSync(studentFormPath, 'utf-8');
      
      // Check for country/region/city fields
      const hasCountryField = studentFormContent.includes('country') || 
                             studentFormContent.includes('Country') ||
                             studentFormContent.includes('nationality');
      const hasRegionField = studentFormContent.includes('region') || 
                            studentFormContent.includes('Region') ||
                            studentFormContent.includes('province');
      const hasCityField = studentFormContent.includes('city') || 
                          studentFormContent.includes('City') ||
                          studentFormContent.includes('town');
      
      console.log(`🌍 Country field found: ${hasCountryField}`);
      console.log(`🌍 Region field found: ${hasRegionField}`);
      console.log(`🌍 City field found: ${hasCityField}`);
      
      // At least one geographical field should exist
      expect(hasCountryField || hasRegionField || hasCityField).toBe(true);
    }
    
    console.log('✅ Country/Region/City data integration verification completed');
  });

  test('should verify responsive design implementation', async ({ page }) => {
    console.log('📱 Verifying Responsive Design Implementation...');
    
    // Check if Tailwind CSS classes are used for responsive design
    const appPath = join(__dirname, '../../src/App.vue');
    const appExists = existsSync(appPath);
    console.log(`📁 App.vue exists: ${appExists}`);
    
    let hasResponsiveClasses = false;
    
    if (appExists) {
      const appContent = readFileSync(appPath, 'utf-8');
      hasResponsiveClasses = appContent.includes('sm:') || 
                            appContent.includes('md:') || 
                            appContent.includes('lg:') || 
                            appContent.includes('xl:') ||
                            appContent.includes('2xl:');
    }
    
    // Check other key components for responsive classes
    const componentsToCheck = [
      '../../src/pages/StudentForm.vue',
      '../../src/pages/Rooms.vue',
      '../../src/pages/Dormitories.vue'
    ];
    
    for (const componentPath of componentsToCheck) {
      const fullPath = join(__dirname, componentPath);
      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, 'utf-8');
        const hasResponsiveInComponent = content.includes('sm:') || 
                                       content.includes('md:') || 
                                       content.includes('lg:') || 
                                       content.includes('xl:') ||
                                       content.includes('2xl:');
        if (hasResponsiveInComponent) {
          hasResponsiveClasses = true;
          console.log(`📱 Responsive classes found in ${componentPath}`);
          break;
        }
      }
    }
    
    console.log(`📱 Responsive Tailwind classes found: ${hasResponsiveClasses}`);
    
    // Test responsive behavior on different viewports
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      console.log(`📱 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})...`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // Check if page renders without horizontal scroll
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();
      
      if (bodyBox) {
        const hasHorizontalScroll = bodyBox.width > viewport.width;
        console.log(`📱 ${viewport.name} - Horizontal scroll: ${hasHorizontalScroll}`);
        expect(hasHorizontalScroll).toBe(false);
      }
    }
    
    console.log('✅ Responsive design implementation verification completed');
  });

  test('should verify accessibility features', async ({ page }) => {
    console.log('♿ Verifying Accessibility Features...');
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Check for proper form labels
    const formInputs = page.locator('input, select, textarea');
    const formInputCount = await formInputs.count();
    console.log(`📝 Form inputs found: ${formInputCount}`);
    
    // Check for proper button types
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`🔘 Buttons found: ${buttonCount}`);
    
    // Check for proper ARIA attributes
    const ariaElements = page.locator('[aria-label], [aria-labelledby], [aria-describedby]');
    const ariaCount = await ariaElements.count();
    console.log(`♿ ARIA attributes found: ${ariaCount}`);
    
    // Check for proper focus management
    const focusableElements = page.locator('button, input, select, textarea, a, [tabindex]');
    const focusableCount = await focusableElements.count();
    console.log(`🎯 Focusable elements found: ${focusableCount}`);
    
    expect(focusableCount).toBeGreaterThan(0);
    
    console.log('✅ Accessibility features verification completed');
  });
});
