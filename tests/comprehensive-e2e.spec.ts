import { test, expect } from '@playwright/test';

test.describe('Comprehensive E2E: Pace Calculator Core Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('1. VMA and Time Configuration', () => {
    test('VMA Input Sync: Typing in VMA updates the Allure VMA text', async ({ page }) => {
      const vmaInput = page.getByLabel(/Votre VMA/i);
      await vmaInput.fill('18');
      
      // Verification that the hint text updates to the correct mapping (18 km/h = 3:20 min/km)
      await expect(page.getByText(/Allure VMA:\s*0?3:20\/km/i)).toBeVisible();
    });

    test('VMA Estimator Flow: Calculates and overrides VMA based on distance and time', async ({ page }) => {
      // Toggle the estimator section
      await page.getByRole('button', { name: /Je ne connais pas ma VMA/i }).click();

      // Ensure the sections are visible
      const distanceCombobox = page.getByRole('combobox').filter({ hasText: /10 \/?km/i }); // Defaults usually to 10km, wait/find it
      // if not 10km by default, we can select it, but let's assume standard UI interaction
      
      const hoursInput = page.getByLabel(/^h$/i);
      const minutesInput = page.getByLabel(/^min$/i);
      const secondsInput = page.getByLabel(/^sec$/i);

      // Fill a 50-minute 10km (which maps to around 14.1 km/h VMA)
      await hoursInput.fill('0');
      await minutesInput.fill('50');
      await secondsInput.fill('0');

      // Check if the calculated VMA is displayed under the inputs (or replaces the main input)
      // The exact text depends on the app's calculation. Let's look for standard text changes.
      const vmaInput = page.getByLabel(/Votre VMA/i);
      
      // Wait for React to calculate and update value. 
      // 10km in 50m = 12 km/h average pace -> roughly 14.1 VMA (using roughly 85% sustained)
      await expect(vmaInput).not.toHaveValue('20'); // should change from default
      
      // Get the value to print and verify it's not empty
      const updatedVma = await vmaInput.inputValue();
      expect(Number(updatedVma)).toBeGreaterThan(10);
      expect(Number(updatedVma)).toBeLessThan(25);
    });


  });

  test.describe('2. Table Layout & Interaction Modes', () => {
    test('Distances Officielles Mode: Renders standard race columns', async ({ page }) => {
      // It's the default mode, so columns should be visible right away
      await expect(page.getByRole('columnheader', { name: /^10 km$/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /^Marathon$/i })).toBeVisible();
    });

    test('Fractionnées Mode: Renders 100m, 200m interval headers', async ({ page }) => {
      // Switch mode
      await page.locator('#table-view-mode').selectOption('fraction');
      await page.waitForTimeout(500);
      const headers = await page.locator('thead').innerText();
      console.log('Fractionnées Mode Headers:', headers);

      // Check new headers
      await expect(page.getByRole('columnheader', { name: /^100 m$/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /^400 m$/i })).toBeVisible();
      // Make sure 10km is gone (using generic match for any 10km format so we know it vanished)
      await expect(page.getByRole('columnheader', { name: /10\s*km/i })).not.toBeVisible();
    });

    test('Intermédiaires Mode: Renders split chunks up to Semi-Marathon', async ({ page }) => {
      // Switch mode
      await page.locator('#table-view-mode').selectOption('intermediate');

      // Select Semi-marathon as target
      await page.locator('#intermediate-distance').selectOption('Semi-marathon');
      await page.waitForTimeout(500);
      const intermediateHeaders = await page.locator('thead').innerText();
      console.log('Intermédiaires Mode Headers:', intermediateHeaders);

      // There should be a column for 20000m or 21097m depending on table gen (formatted as '21.1 km' due to toFixed(2))
      // Let's assert that the table has populated passage times.
      await expect(page.getByRole('columnheader', { name: /^21\.1 km$/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /^5 km$/i })).toBeVisible();
    });
  });

  test.describe('3. Edge Cases & Safety', () => {
    test('Extreme Intervals: Change interval to 30s shrinks rows without crashing', async ({ page }) => {
      const intervalSelect = page.getByRole('combobox').filter({ hasText: /5s/ });
      await intervalSelect.selectOption({ label: '30s' });

      // Count rows - there should be significantly fewer than with 5s.
      // Default 4:00 to 6:00 is 2 mins -> 120 secs. At 30s interval = ~5 rows.
      const rows = page.locator('table tbody tr');
      // Just assert it doesn't crash and renders a table.
      await expect(rows.first()).toBeVisible();
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(15); 
    });

    test('Dark Mode Context: Toggles dark mode CSS persistent state', async ({ page }) => {
      const displayModeButton = page.getByRole('button', { name: /Light Mode|Dark Mode/i });
      
      const isCurrentlyDark = await page.locator('.App').evaluate((el) => el.classList.contains('dark'));
      
      await displayModeButton.click();
      
      // Should instantly toggle
      if (isCurrentlyDark) {
        await expect(page.locator('.App')).not.toHaveClass(/dark/);
      } else {
        await expect(page.locator('.App')).toHaveClass(/dark/);
      }
    });
  });
});
