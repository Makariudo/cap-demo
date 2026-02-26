import { test, expect } from '@playwright/test';

test('enable color mode shows red background for 10km at 3:00 allure', async ({ page }) => {
  await page.goto('/');

  // 1. Remplir le champ VMA à 22
  const vmaInput = page.locator('input#vma');
  await vmaInput.fill('22');

  // 2. Configuration d'affichage: Allure min à 4:00
  // Index 0: Min minute, Index 1: Min second
  const selects = page.locator('.config-row select');
  await selects.nth(0).selectOption('4');
  await selects.nth(1).selectOption('0');

  // Configuration d'affichage: Allure max à 2:00
  // Index 2: Max minute, Index 3: Max second
  await selects.nth(2).selectOption('2');
  await selects.nth(3).selectOption('0');

  // 3. Cliquer sur Enable Color Mode
  await page.getByRole('button', { name: 'Enable Color Mode' }).click();

  // 4. Vérifier que dans le tableau, la colonne 10km sur l'allure 3:00 a bien un fond rouge.
  // The row has '3:00' as the first cell, and we need the cell for 10km.
  const targetRow = page.locator('table tbody tr', { has: page.locator('td', { hasText: /^3:00$/ }) });
  
  // Index 6 corresponds specifically to "10 Km" in the Distances Officielles mode
  const targetCell = targetRow.locator('td').nth(6);
  await expect(targetCell).toHaveText('30:00');

  // Vérifier la couleur de fond
  const bgColor = await targetCell.evaluate(el => window.getComputedStyle(el).backgroundColor);
  const match = bgColor.match(/^rgb\((\d+), (\d+), (\d+)\)$/);
  expect(match).not.toBeNull();
  
  if (match) {
    const red = parseInt(match[1], 10);
    const green = parseInt(match[2], 10);
    const blue = parseInt(match[3], 10);
    
    // Le rouge doit être prédominant
    expect(red).toBeGreaterThan(150);
    // Le bleu doit être très faible voir 0
    expect(blue).toBe(0);
    expect(red).toBeGreaterThan(green);
  }
});
