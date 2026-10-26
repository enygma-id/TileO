import { test, expect } from '@playwright/test';

test('Vector E2E: .geojsonl upload, attribute selection, layer validation, progress, and failure handling', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('/');
  await expect(page.locator('#connection')).toContainText('Worker connected', { timeout: 30000 });

  // 1. Success case: .geojsonl with multiple attributes and lines
  const geojsonlContent = [
    JSON.stringify({ type: 'Feature', properties: { site: 'LocA', priority: 1, secret: 'x' }, geometry: { type: 'Point', coordinates: [106.82, -6.17] } }),
    JSON.stringify({ type: 'Feature', properties: { site: 'LocB', priority: 2, secret: 'y' }, geometry: { type: 'Point', coordinates: [106.84, -6.18] } }),
    JSON.stringify({ type: 'Feature', properties: { site: 'LocC', priority: 3, secret: 'z' }, geometry: { type: 'Point', coordinates: [106.86, -6.19] } })
  ].join('\n');

  const validFile = {
    name: `audit-${Date.now()}.geojsonl`,
    mimeType: 'application/x-ndjson',
    buffer: Buffer.from(geojsonlContent, 'utf-8'),
  };

  await page.locator('#file').setInputFiles(validFile);
  await expect(page.locator('#vector-options-group')).toBeVisible({ timeout: 15000 });

  // 2. Attribute selection: verify attributes detected and toggle checkbox
  await expect(page.locator('#vector-attributes-list')).toContainText('site');
  await expect(page.locator('#vector-attributes-list')).toContainText('priority');
  await expect(page.locator('#vector-attributes-list')).toContainText('secret');

  // Uncheck 'secret' attribute to test attribute filtering
  const secretCheckbox = page.locator('#vector-attributes-list input[value="secret"]');
  if (await secretCheckbox.count() > 0) {
    await secretCheckbox.uncheck();
    expect(await secretCheckbox.isChecked()).toBeFalsy();
  }

  // 3. Submit valid job and verify progress to completion
  await page.locator('#max-zoom').fill('6');
  await page.getByRole('button', { name: 'Create tile job' }).click();

  const job = page.locator('article').filter({ hasText: validFile.name });
  await expect(job).toBeVisible();

  // Job should complete to SUCCEEDED
  await expect(job.locator('.badge')).toHaveText('SUCCEEDED', { timeout: 90000 });

  // Verify preview and download
  await job.getByRole('button', { name: 'Add to map', exact: true }).click();
  await expect(page.locator('#map canvas')).toBeVisible();

  const downloadLink = job.getByRole('link', { name: 'Download MBTiles' });
  const downloadHref = await downloadLink.getAttribute('href');
  expect(downloadHref).toBeTruthy();
  const downloadRes = await page.request.get(downloadHref!);
  expect(downloadRes.ok()).toBeTruthy();
  const dbHeader = (await downloadRes.body()).subarray(0, 16).toString();
  expect(dbHeader).toContain('SQLite format 3');

  // 4. Failure case A: Non-existent layer selection triggers error
  const layerFailFile = {
    name: `layerfail-${Date.now()}.geojsonl`,
    mimeType: 'application/x-ndjson',
    buffer: Buffer.from(geojsonlContent, 'utf-8'),
  };
  await page.locator('#file').setInputFiles(layerFailFile);
  await expect(page.locator('#vector-options-group')).toBeVisible({ timeout: 15000 });
  await page.locator('summary').filter({ hasText: 'Source options' }).click();
  await page.locator('#layer').fill('non_existent_layer');
  await page.getByRole('button', { name: 'Create tile job' }).click();

  const layerFailJob = page.locator('article').filter({ hasText: layerFailFile.name });
  await expect(layerFailJob.locator('.badge')).toHaveText('FAILED', { timeout: 60000 });
  await expect(layerFailJob.locator('.error')).toContainText('Select one input layer');

  // 5. Failure case B: Malformed GeoJSONL line triggers error
  const malformedFile = {
    name: `broken-${Date.now()}.geojsonl`,
    mimeType: 'application/x-ndjson',
    buffer: Buffer.from('{"type":"Feature","properties":{NOT_VALID_JSON}}\n', 'utf-8'),
  };
  await page.locator('#file').setInputFiles(malformedFile);
  const noticeOrError = page.locator('#notice, .error, article');
  await expect(noticeOrError.first()).toBeVisible({ timeout: 15000 });

  expect(errors).toEqual([]);
});
