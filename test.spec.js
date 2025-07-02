const { test, expect } = require('@playwright/test');

test('open Blinkit and check title', async ({ page }) => {
  await page.goto('https://www.blinkit.com/');
  await expect(page).toHaveTitle(/Blinkit/);
}); 