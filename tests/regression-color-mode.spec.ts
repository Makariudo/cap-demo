import { test, expect } from '@playwright/test';

test.describe('Anti-Regression: Golden Test for VMA Table', () => {
  test('Should render correct background colors for distances (3km, 10km, Semi-marathon)', async ({ page }) => {
    // 1. Navigation Initiale
    await page.goto('/');

    // 2. Remplir le champ VMA
    const vmaInput = page.getByLabel(/vma/i).or(page.locator('input#vma'));
    await expect(vmaInput).toBeVisible();
    await vmaInput.fill('20');

    // 3. Configuration d'affichage: Allure min 4'00, Allure max 2'00
    const selects = page.locator('.config-row select');
    await selects.nth(0).selectOption('4');
    await selects.nth(1).selectOption('0');
    await selects.nth(2).selectOption('2');
    await selects.nth(3).selectOption('0');

    // 4. Configurer l'intervalle à 1s
    // Check if label works, otherwise fallback to finding the select containing '1s'
    await page.getByRole('combobox').filter({ hasText: /1s/ }).selectOption({ label: '1s' });

    // 5. Activer le mode couleur
    const enableColorBtn = page.getByRole('button', { name: /enable color mode/i });
    await enableColorBtn.click();

    // 6. Validation "Golden Path" - Anti-régression (Exact Color Extraction)
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Helper function to extract and verify background color
    const verifyCellColor = async (rowPace: string, colIndex: number, distanceName: string) => {
      // Find the row corresponding to the specific pace
      const targetRow = page.locator('table tbody tr', { has: page.locator('td', { hasText: new RegExp(`^${rowPace}$`) }) });
      await expect(targetRow).toBeVisible();

      // Find the cell representing the specific distance
      const targetCell = targetRow.locator('td').nth(colIndex);

      // We wait for the background-color to NOT be transparent, which means color mode is applied
      await expect(targetCell).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

      // Extract the computed color to check its value
      const bgColor = await targetCell.evaluate(el => window.getComputedStyle(el).backgroundColor);
      
      // Expected rgb(...) or rgba(...) format
      expect(bgColor).toMatch(/^rgba?\(\d+, \d+, \d+(?:, [0-9.]+)?\)$/);
      
      const match = bgColor.match(/^rgba?\((\d+), (\d+), (\d+)/);
      if (match) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        
        expect(r + g + b).not.toBe(765); // Not pure white
        expect(r + g + b).not.toBe(0); // Not pure black
      }
      return bgColor;
    };

    // Verify for the 3:10 min/km pace, distances: 3000 m (col 4)
    console.log('Verifying Pace 3:10 for 3km:');
    const color3km = await verifyCellColor('3:10', 4, '3km'); // index 4 = 1000, 1500, 2000, 3000m (3km is 4th col after allure)
    expect(color3km).toBe('rgb(104, 151, 0)');
    
    console.log('Verifying Pace 3:30 for 10km:');
    const color10km = await verifyCellColor('3:30', 6, '10km');
    expect(color10km).toBe('rgb(66, 189, 0)');
    
    console.log('Verifying Pace 3:40 for Semi-marathon:');
    const colorSemi = await verifyCellColor('3:40', 9, 'Semi-marathon');
    expect(colorSemi).toBe('rgb(108, 147, 0)');

    // Snapshot is still useful as a fallback visual golden master
    await expect(table).toHaveScreenshot('paces-table-color-mode-20vma.png', {
      maxDiffPixels: 200,
    });
  });
});

