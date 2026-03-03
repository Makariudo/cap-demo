import { test, expect } from '@playwright/test';

test('Calculateur d\'allure - Golden Test for Paces and Colors', async ({ page }) => {
  await page.goto('/');

  // 1. Enter VMA of 20
  const vmaInput = page.getByRole('spinbutton', { name: 'Votre VMA (km/h):' });
  await vmaInput.fill('20');

  // Wait for calculations to update
  await page.waitForTimeout(500);

  // 2. Enable Color Mode
  const colorModeBtn = page.getByRole('button', { name: 'Enable Color Mode' });
  await colorModeBtn.click();

  // Validate the color mode has been toggled
  const disableColorBtn = page.getByRole('button', { name: 'Disable Color Mode' });
  await expect(disableColorBtn).toBeVisible();

  // 3. Configure pace min and max using the select fields
  const selects = page.locator('select');
  
  // Allure min to 4:00 (slower pace)
  await selects.nth(1).selectOption('4');
  await selects.nth(2).selectOption('00');

  // Allure max to 2:00 (faster pace)
  await selects.nth(3).selectOption('2');
  await selects.nth(4).selectOption('00');

  // 4. Configure interval to 1s
  const intervalSelect = page.getByRole('combobox', { name: 'Intervalle (secondes):' });
  await intervalSelect.selectOption('1s');

  // Wait for the table and UI styling to update specifically for colors
  await page.waitForTimeout(1000);

  // 5. Golden Assertions: Values and Colors for specific paces
  
  // -- Test Case 1: 3:34/km -- 
  const row334 = page.getByRole('row').filter({ has: page.getByRole('cell', { name: '3:34', exact: true }) }).first();
  await expect(row334).toBeVisible();
  
  // Validate text for distances 3km, 5km, 10km (3000m, 5000m, 10 Km)
  await expect(row334).toContainText('10:42'); // 3000m
  await expect(row334).toContainText('17:50'); // 5000m
  await expect(row334).toContainText('35:40'); // 10km

  // Validate Color is "vert clair" (green) for slower pace vs target
  const colors334 = await row334.evaluate((node: any) => {
    const tds = Array.from(node.querySelectorAll('td'));
    return tds.map((td: any) => td.style.backgroundColor);
  });
  const bg334_10km = colors334[6]; // Index 6 is the 10km column which has colors in output
  expect(bg334_10km).toBe('rgb(4, 251, 0)'); // Vert clair
  
  // -- Test Case Intermediate: 3:26/km (gradient validation) --
  const row326 = page.getByRole('row').filter({ has: page.getByRole('cell', { name: '3:26', exact: true }) }).first();
  await expect(row326).toContainText('34:20'); // 10km
  const colors326 = await row326.evaluate((node: any) => {
    const tds = Array.from(node.querySelectorAll('td'));
    return tds.map((td: any) => td.style.backgroundColor);
  });
  const bg326_10km = colors326[6];
  expect(bg326_10km).toContain('rgb(');
  // Ensure we have a gradient color that is different from both extremes
  expect(bg326_10km).not.toEqual(bg334_10km);
  
  // -- Test Case 2: 3:18/km --
  const row318 = page.getByRole('row').filter({ has: page.getByRole('cell', { name: '3:18', exact: true }) }).first();
  await expect(row318).toBeVisible();

  // Validate text for distances 3km, 5km, 10km (3000m, 5000m, 10 Km)
  await expect(row318).toContainText('09:54'); // 3000m
  await expect(row318).toContainText('16:30'); // 5000m
  await expect(row318).toContainText('33:00'); // 10km

  // Validate Color is "rouge vif" (red) for faster pace vs target
  const colors318 = await row318.evaluate((node: any) => {
    const tds = Array.from(node.querySelectorAll('td'));
    return tds.map((td: any) => td.style.backgroundColor);
  });
  const bg318_10km = colors318[6]; // Index 6 is the 10km column
  expect(bg318_10km).toBe('rgb(252, 3, 0)'); // Rouge vif
  
  // Compare the colors to ensure they are visually different and confirm the gradient
  expect(bg334_10km).not.toEqual(bg318_10km);
  expect(bg326_10km).not.toEqual(bg318_10km);
});
