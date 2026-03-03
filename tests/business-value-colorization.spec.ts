import { test, expect } from '@playwright/test';

test.describe('Business Value Colorization (Golden Test)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  const enableColorModeAndSetInterval = async (page) => {
    // Set Interval to 1s
    const intervalSelect = page.getByLabel(/Intervalle/i);
    await intervalSelect.selectOption('1');

    // Enable Color Mode
    const colorModeButton = page.getByRole('button', { name: /Enable Color Mode/i });
    await colorModeButton.click();
    
    // Ensure Color mode registered
    await expect(page.getByRole('button', { name: /Disable Color Mode/i })).toBeVisible();
  };

  const setPaceBounds = async (page, minMin: string, minSec: string, maxMin: string, maxSec: string) => {
    const minPaceRow = page.locator('.config-row').filter({ hasText: 'Allure min' });
    await minPaceRow.locator('select').first().selectOption({ value: minMin });
    await minPaceRow.locator('select').nth(1).selectOption({ value: minSec });

    const maxPaceRow = page.locator('.config-row').filter({ hasText: 'Allure max' });
    await maxPaceRow.locator('select').first().selectOption({ value: maxMin });
    await maxPaceRow.locator('select').nth(1).selectOption({ value: maxSec });
  };

  test('VMA Based Colorization: VMA 15, VMA 20', async ({ page }) => {
    await enableColorModeAndSetInterval(page);

    // --- Scenario 1: VMA = 15 ---
    const vmaInput = page.getByRole('spinbutton', { name: /Votre VMA/i });
    await vmaInput.fill('15');

    // Restrict pace bounds around target paces to build table quickly with 1s intervals
    // Targets: 04:30 and 05:15
    // Note: Allure Min is slower (higher time), Allure Max is faster (lower time)
    await setPaceBounds(page, '5', '30', '4', '20');

    // Take screenshot of VMA 15 configuration
    const tableContainer = page.locator('.table-container');
    await expect(tableContainer).toBeVisible();
    await expect(tableContainer).toHaveScreenshot('business-value-vma-15.png');

    // --- Scenario 2: VMA = 20 ---
    await vmaInput.fill('20');
    
    // Restrict pace bounds around target paces to build table quickly
    // Targets: 03:15 and 03:55
    await setPaceBounds(page, '4', '10', '3', '0');

    // Take screenshot of VMA 20 configuration
    await expect(tableContainer).toBeVisible();
    await expect(tableContainer).toHaveScreenshot('business-value-vma-20.png');
  });

  test('Reference Time Based Colorization: 10km in 40min, Marathon in 3h30', async ({ page }) => {
    await enableColorModeAndSetInterval(page);

    // Open Estimator
    await page.getByRole('button', { name: /Je ne connais pas ma VMA/i }).click();
    
    // --- Reference 1: 10km in 40min ---
    // The estimator defaults to 10km
    await page.locator('.reference-time').getByLabel(/^h$/i).fill('0');
    await page.locator('.reference-time').getByLabel(/^min$/i).fill('40');
    await page.locator('.reference-time').getByLabel(/^sec$/i).fill('0');
    
    // Trigger calculation
    await page.getByRole('button', { name: /Calculer la VMA/i }).click();

    // That gives a VMA around 17.5. Wait for VMA input to visibly update
    const vmaInput = page.getByRole('spinbutton', { name: /Votre VMA/i });
    await expect(vmaInput).not.toHaveValue('20', { timeout: 3000 });

    // Target a sensible pace for Semi with VMA 17.5. Roughly 4:15
    await setPaceBounds(page, '4', '30', '4', '0');

    // Take screenshot of Reference Time 1 configuration
    const tableContainer = page.locator('.table-container');
    await expect(tableContainer).toBeVisible();
    await expect(tableContainer).toHaveScreenshot('business-value-ref1-10km40min.png');


    // --- Reference 2: Marathon in 3h30 ---
    const distanceCombobox = page.locator('#reference-distance'); 
    await distanceCombobox.selectOption({ label: 'Marathon' });
    
    await page.locator('.reference-time').getByLabel(/^h$/i).fill('3');
    await page.locator('.reference-time').getByLabel(/^min$/i).fill('30');
    await page.locator('.reference-time').getByLabel(/^sec$/i).fill('0');

    // Trigger calculation
    await page.getByRole('button', { name: /Calculer la VMA/i }).click();

    // Wait for update
    await expect(vmaInput).not.toHaveValue('17', { timeout: 3000 });

    // With a 3h30 Marathon, average pace is ~4:58/km. VMA is ~15.5.
    // Target 10km pace: likely around 4:25
    await setPaceBounds(page, '5', '0', '4', '10');

    // Take screenshot of Reference Time 2 configuration
    await expect(tableContainer).toBeVisible();
    await expect(tableContainer).toHaveScreenshot('business-value-ref2-marathon3h30.png');
  });
});

