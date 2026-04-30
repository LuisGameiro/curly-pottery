import { test, expect } from '@playwright/test';

test('homepage has title and links to shop', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // Replace "Curly Pottery" with whatever your actual site title is
  await expect(page).toHaveTitle(/Curly Pottery/i);

  // Check for a call to action or shop link
  const shopLink = page.getByRole('link', { name: /shop/i }).first();
  await expect(shopLink).toBeVisible();
});
