import { expect, test } from '@playwright/test';

test('dashboard controls respond', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /run analysis/i }).click();
  await expect(page.getByText(/analysis complete/i)).toBeVisible({ timeout: 8000 });
  await page.getByRole('button', { name: /alerts/i }).click();
  await expect(page.getByRole('heading', { name: 'Priority Findings' })).toBeVisible();
  await page.getByRole('button', { name: /urban/i }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /export report/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('orbital-change-report');
  await page.screenshot({ path: 'tmp/interactive-smoke.png' });
});
