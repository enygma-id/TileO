import { test, expect } from '@playwright/test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

test('raster compare shows source GeoTIFF vs result tiles', async ({ page }) => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-raster-compare-'));
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const encoderUrl = new URL('../../dist/elevation.js', import.meta.url).href;
  const { terrainPng } = await import(encoderUrl);
  const basemap = terrainPng(new Float64Array(256 * 256).fill(-10000 + 0xeceff2 * 0.1));
  await page.route('**/api/basemap/osm/**', route => route.fulfill({ contentType: 'image/png', body: basemap }));
  try {
    // 64x64 PPM: left half red, right half blue, so the swipe difference is obvious.
    const pixels = Buffer.alloc(64 * 64 * 3);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const p = (y * 64 + x) * 3;
      if (x < 32) { pixels[p] = 255; pixels[p + 1] = 0; pixels[p + 2] = 0; }
      else { pixels[p] = 0; pixels[p + 1] = 0; pixels[p + 2] = 255; }
    }
    await writeFile(join(dir, 'half.ppm'), Buffer.concat([Buffer.from('P6\n64 64\n255\n'), pixels]));
    const runnerUrl = new URL('../../dist/process.js', import.meta.url).href;
    const { run } = await import(runnerUrl);
    const tif = join(dir, 'half.tif');
    await run('gdal_translate', ['-a_srs', 'EPSG:4326', '-a_ullr', '119', '-5', '119.1', '-5.1', join(dir, 'half.ppm'), tif]);
    const file = { name: `raster-compare-${Date.now()}.tif`, mimeType: 'image/tiff', buffer: await readFile(tif) };
    await page.goto('/');
    await expect(page.locator('#connection')).toContainText('Worker connected', { timeout: 30000 });
    await page.locator('#file').setInputFiles(file);
    await expect(page.locator('#raster-options-group')).toBeVisible();
    await page.getByRole('button', { name: 'Create tile job' }).click();
    const job = page.locator('article').filter({ hasText: file.name });
    await expect(job.locator('.badge')).toHaveText('SUCCEEDED', { timeout: 90000 });
    await job.getByRole('button', { name: 'Add to map', exact: true }).click();
    await expect(page.locator('#map canvas')).toBeVisible();
    await expect(page.locator('#btn-landing-sample')).toBeVisible();
    await page.locator('#btn-landing-sample').click();
    await expect(page.locator('#landing-dialog')).toBeVisible();
    const properties = page.locator('#landing-properties');
    await expect(properties).toContainText(file.name);
    await expect(properties).toContainText('/api/jobs/');
    await expect(properties).toContainText('bounds');
    await expect(properties).toContainText('center');
    await expect(properties).toContainText('tiles');
    await expect(page.locator('#landing-zoom')).toHaveValue(/[\d.]+/);
    const zoomBefore = Number(await page.locator('#landing-zoom').inputValue());
    const centerBefore = await page.locator('#landing-center-value').textContent();
    const canvasBox = await page.locator('#map canvas').boundingBox();
    expect(canvasBox).not.toBeNull();
    const mapX = canvasBox!.x + Math.max(60, canvasBox!.width * 0.18);
    const mapY = canvasBox!.y + canvasBox!.height * 0.62;
    await page.mouse.move(mapX, mapY);
    await page.mouse.wheel(0, -360);
    await expect.poll(async () => Number(await page.locator('#landing-zoom').inputValue())).toBeGreaterThan(zoomBefore);
    await page.mouse.move(mapX, mapY);
    await page.mouse.down();
    await page.mouse.move(mapX + 70, mapY + 30, { steps: 10 });
    await page.mouse.up();
    await expect.poll(async () => page.locator('#landing-center-value').textContent()).not.toBe(centerBefore);
    await page.locator('#landing-zoom').fill('9');
    await expect(page.locator('#landing-snippet')).toHaveValue(/^ {2}zoom: 9,$/m);
    const snippet = await page.locator('#landing-snippet').inputValue();
    expect(snippet).toContain(`name: '${file.name}'`);
    expect(snippet).toContain("url: '/api/jobs/");
    expect(snippet).toContain('bounds: [');
    expect(snippet).toContain('center: [');
    expect(snippet).toContain('minzoom: 0');
    expect(snippet).toContain('tiles: ');
    await page.locator('#close-landing-dialog').click();
    await expect(page.locator('#landing-dialog')).toBeHidden();
    await job.getByRole('button', { name: 'More actions' }).click();
    await job.getByRole('menuitem', { name: 'Compare source' }).click();
    await expect(page.locator('.compare-control')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
    await expect(page.locator('.compare-label-source')).toContainText('GeoTIFF imagery');
    await expect(page.locator('.compare-label-result')).toBeVisible();
    await expect(page.locator('.compare-source-map canvas')).toBeVisible();
    await page.getByRole('button', { name: 'Source only', exact: true }).click();
    await expect(page.locator('.compare-label-result')).toBeHidden();
    await page.getByRole('button', { name: 'Result only', exact: true }).click();
    await expect(page.locator('.compare-label-source')).toBeHidden();
    await page.getByRole('button', { name: '50 : 50', exact: true }).click();
    await expect(page.locator('.compare-source-map')).toHaveCSS('clip-path', 'inset(0px 50% 0px 0px)');
    await page.screenshot({ path: 'test-results/compare-raster.png', fullPage: true });
    await page.locator('.compare-control').getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.locator('.compare-control')).toHaveCount(0);
    // Quick Open reuses the result map: it must release both the source overlay
    // and its listeners before displaying the new dataset.
    await job.getByRole('button', { name: 'More actions' }).click();
    await job.getByRole('menuitem', { name: 'Compare source' }).click();
    await expect(page.locator('.compare-control')).toHaveAttribute('data-ready', 'true');
    await page.locator('#quick-file').setInputFiles({
      name: 'after-compare.geojson', mimeType: 'application/geo+json',
      buffer: Buffer.from(JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: { name: 'Quick Open' }, geometry: { type: 'Point', coordinates: [119.05, -5.05] } }] })),
    });
    await expect(page.locator('#preview-name')).toHaveText('after-compare.geojson');
    await expect(page.locator('.compare-control, .compare-source-map, .compare-divider, .compare-label')).toHaveCount(0);
    // A later comparison must still open normally after Quick Open.
    await expect(page.locator('#quick-open')).toHaveAttribute('aria-busy', 'false');
    await job.getByRole('button', { name: 'More actions' }).click();
    await job.getByRole('menuitem', { name: 'Compare source' }).click();
    await expect(page.locator('.compare-control')).toHaveAttribute('data-ready', 'true');
    await page.locator('#quick-file').setInputFiles(file);
    await expect(page.locator('#preview-name')).toHaveText(file.name);
    await expect(page.locator('.compare-control, .compare-source-map')).toHaveCount(0);
    expect(errors).toEqual([]);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
