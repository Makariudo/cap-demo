import { test, expect } from '@playwright/test';

test.describe('Sauvegarde et Restauration du localStorage', () => {
  test('devrait sauvegarder et restaurer la configuration', async ({ page }) => {
    // 1. Accéder à l'application
    await page.goto('/');

    // S'assurer que les valeurs par défaut sont différentes des valeurs que nous allons tester
    // 2. Renseigner une VMA et des allures spécifiques
    await page.locator('#vma').fill('18');
    
    // Configurer Allure min (ex: 5:30)
    const selects = page.locator('select');
    await selects.nth(1).selectOption('5');
    await selects.nth(2).selectOption('30');
    
    // Configurer Allure max (ex: 3:15)
    await selects.nth(3).selectOption('3');
    await selects.nth(4).selectOption('15');

    // Intervalle (ex: 10s)
    await page.locator('#interval').selectOption('10');

    // 3. Sauvegarder
    // handle dialogs (window.alert)
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Sauvegarder' }).click();

    // 4. Reset la page ou modifier les valeurs pour s'assurer de la restauration
    await page.locator('#vma').fill('12');
    await page.locator('#interval').selectOption('30');

    // 5. Restaurer
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Restaurer' }).click();

    // 6. Vérifier que la configuration est bien revenue
    await expect(page.locator('#vma')).toHaveValue('18');
    await expect(page.locator('#interval')).toHaveValue('10');
    
    // Control dropdowns specifically via their values
    await expect(selects.nth(1)).toHaveValue('5');
    await expect(selects.nth(2)).toHaveValue('30');
    
    await expect(selects.nth(3)).toHaveValue('3');
    await expect(selects.nth(4)).toHaveValue('15');
  });
});
