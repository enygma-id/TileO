import { test, expect } from '@playwright/test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

test('Quick Open streams an original GeoTIFF without tiling', async ({ page }) => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-quickopen-tiff-'));
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const encoderUrl = new URL('../../dist/elevation.js', import.meta.url).href;
  const { terrainPng } = await import(encoderUrl);
  const basemap = terrainPng(new Float64Array(256 * 256).fill(-10000 + 0xeceff2 * 0.1));
  await page.route('**/api/basemap/osm/**', route => route.fulfill({ contentType: 'image/png', body: basemap }));
  try {
    const pixels = Buffer.alloc(32 * 32 * 3, 200);
    await writeFile(join(dir, 'gray.ppm'), Buffer.concat([Buffer.from('P6\n32 32\n255\n'), pixels]));
    const runnerUrl = new URL('../../dist/process.js', import.meta.url).href;
    const { run } = await import(runnerUrl);
    const tif = join(dir, 'gray.tif');
    await run('gdal_translate', ['-a_srs', 'EPSG:4326', '-a_ullr', '119', '-5', '119.1', '-5.1', join(dir, 'gray.ppm'), tif]);
    const file = { name: `quickopen-${Date.now()}.tif`, mimeType: 'image/tiff', buffer: await readFile(tif) };
    await page.goto('/');
    await expect(page.locator('#connection')).toContainText('Worker connected', { timeout: 30000 });
    const streamed = page.waitForResponse(response => /\/api\/quick\/.+\/file$/.test(response.url()) && (response.status() === 200 || response.status() === 206));
    await page.locator('#quick-file').setInputFiles(file);
    await expect(page.locator('#preview-name')).toHaveText(file.name);
    await expect(page.locator('#loaded-data-info')).toContainText('Direct GeoTIFF');
    await expect(page.locator('#loaded-data-info')).toContainText('RGB');
    expect([200, 206]).toContain((await streamed).status());
    await expect(page.locator('#map canvas')).toBeVisible();
    // Allow the zoom-to-extent flight and tile rendering to settle.
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/quickopen-tiff.png', fullPage: true });
    // Opening the same entry again (or anything else) must not break the map.
    await page.locator('#btn-clear-preview').click();
    await expect(page.locator('#preview-name')).toContainText('Basemap only');
    expect(errors).toEqual([]);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('Quick Open shows loading and recovers after an upload error', async ({ page }) => {
  await page.goto('/');
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/quick/tiff?*', async route => {
    await pending;
    await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: { message: 'Invalid TIFF fixture' } }) });
  });
  await page.locator('#quick-file').setInputFiles({ name: 'invalid.tif', mimeType: 'image/tiff', buffer: Buffer.from('invalid') });
  try {
    await expect(page.locator('#quick-open')).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('#quick-open-text')).toHaveText(/Loading \d+%/);
    await expect(page.locator('#quick-progress-value')).toHaveText(/\d+%/);
    await expect(page.locator('#quick-progress')).toHaveAttribute('value', /\d+/);
    await expect(page.locator('#quick-file')).toBeDisabled();
    await expect(page.locator('#quick-progress-panel')).toBeVisible();
    await expect(page.locator('#quick-progress-file')).toHaveText('invalid.tif');
  } finally { release(); }
  await expect(page.locator('#quick-open-text')).toHaveText('Quick Open');
  await expect(page.locator('#quick-file')).toBeEnabled();
  await expect(page.locator('#quick-progress-panel')).toBeHidden();
  await expect(page.locator('#notice')).toContainText('Invalid TIFF fixture');
  await expect(page.locator('.brand-icon, .badge-tag')).toHaveCount(0);
});


test('GeoJSON Quick Open displays percentage through parsing and preview preparation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.zoom-level-ctrl')).toBeVisible();
  const data = JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [119, -5] } }] });
  await page.evaluate(() => {
    (window as any).quickProgressUpdates = [];
    new MutationObserver(() => {
      (window as any).quickProgressUpdates.push(document.getElementById('quick-progress-value')!.textContent);
    }).observe(document.getElementById('quick-progress-value')!, { childList: true });
  });
  await page.locator('#quick-file').setInputFiles({ name: 'progress.geojson', mimeType: 'application/geo+json', buffer: Buffer.from(data) });
  await expect(page.locator('#preview-name')).toHaveText('progress.geojson');
  await expect(page.locator('#quick-progress-value')).toHaveText('100%');
  await expect(page.locator('#quick-progress-panel')).toBeHidden();
  const updates = await page.evaluate(() => (window as any).quickProgressUpdates);
  expect(updates).toContain('75%');
  expect(updates).toContain('85%');
  expect(updates).toContain('100%');
});
