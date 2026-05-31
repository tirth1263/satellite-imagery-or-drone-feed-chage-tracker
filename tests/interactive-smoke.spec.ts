import { expect, test } from '@playwright/test';

test('dashboard controls respond', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });

  await page.getByRole('link', { name: 'Mission' }).click();
  await expect(page.getByRole('status')).toContainText(/Mission console selected/i);
  await page.getByRole('link', { name: 'Models' }).click();
  await expect(page.getByRole('status')).toContainText(/Model confidence stack selected/i);
  await page.getByRole('link', { name: 'Pipeline' }).click();
  await expect(page.getByRole('status')).toContainText(/Operational pipeline selected/i);
  await page.getByLabel('Orbital Change Tracker home').click();

  await page.getByRole('button', { name: /^Landsat 8 \+ Drone$/ }).click();
  await page.getByRole('option', { name: /sentinel-2 msi/i }).click();
  await expect(page.getByRole('status')).toContainText(/Sahara Urban Edge loaded/i);
  await page.getByRole('button', { name: /Alpine Reservoir Corridor/i }).click();
  await expect(page.getByRole('status')).toContainText(/Alpine Reservoir Corridor loaded/i);

  await page.getByRole('button', { name: /run analysis/i }).click();
  await expect(page.getByRole('status')).toContainText(/analysis complete/i, { timeout: 8000 });
  await page.getByRole('button', { name: /alerts/i }).click();
  await expect(page.getByRole('heading', { name: 'Priority Findings' })).toBeVisible();
  await page.getByRole('button', { name: /reservoir boundary shift/i }).click();
  await expect(page.getByRole('status')).toContainText(/Reservoir boundary shift alert opened/i);

  await page.getByRole('button', { name: 'Urban', exact: true }).click();
  await expect(page.getByRole('status')).toContainText(/Urban layer enabled/i);

  const geoJsonPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /export geojson/i }).click();
  const geoJson = await geoJsonPromise;
  expect(geoJson.suggestedFilename()).toContain('change-zones');

  await page.getByRole('button', { name: /yolo objects/i }).click();
  await expect(page.getByRole('status')).toContainText(/YOLO Objects confidence/i);
  await page.getByRole('button', { name: /detect run ndvi/i }).click();
  await expect(page.getByRole('status')).toContainText(/Detect stage selected/i);

  const reportPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /export report/i }).click();
  const report = await reportPromise;
  expect(report.suggestedFilename()).toContain('orbital-change-report');
  await page.screenshot({ path: 'tmp/interactive-smoke.png' });
});
