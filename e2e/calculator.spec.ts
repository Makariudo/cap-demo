import { test, expect } from '@playwright/test';

test('Calculateur d\'allure - VMA and Color Mode features', async ({ page }) => {
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

  // Wait for the table to update
  await page.waitForTimeout(500);

  // 5. Assertions: Paces calculation and Colors
  // Row for 3:00/km (VMA 20 corresponds to 3:00/km)
  const row300 = page.getByRole('row').filter({ has: page.getByRole('cell', { name: '3:00', exact: true }) }).first();
  await expect(row300).toBeVisible();

  // Validate calculations: 1000m should be '03:00', 10Km should be '30:00', Marathon '02:06:35'
  await expect(row300).toContainText('03:00');
  await expect(row300).toContainText('30:00');
  await expect(row300).toContainText('02:06:35');

  // Validate color mode colors are applied.
  // The cell should have a background color (not transparent).
  const rowClassAndStyle = await row300.evaluate((node: any) => {
    const targetNode = node.cells ? node.cells[0] : node;
    return {
      styleBg: targetNode.style.backgroundColor,
      computedBg: window.getComputedStyle(targetNode).backgroundColor
    };
  });
  
  // Computed BG should not be the default transparent (rgba(0, 0, 0, 0))
  // Typically it's rgb(...)
  expect(rowClassAndStyle.computedBg).not.toBe('rgba(0, 0, 0, 0)');
  expect(rowClassAndStyle.computedBg).not.toBe('transparent');
  
  // We can also verify that a specific pace like 3:30 is generated due to max pace 4:00
  // and 2:30 is generated due to min pace 2:00.
  const row230 = page.getByRole('row').filter({ has: page.getByRole('cell', { name: '2:30', exact: true }) }).first();
  await expect(row230).toBeVisible();

  const row330 = page.getByRole('row').filter({ has: page.getByRole('cell', { name: '3:30', exact: true }) }).first();
  await expect(row330).toBeVisible();
});
