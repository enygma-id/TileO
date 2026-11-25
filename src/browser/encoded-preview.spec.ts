import { test, expect } from '@playwright/test';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { tilePng } from '../tile-png.js';

const size = 256;
const longitude = (x: number) => x * 360 / size - 180;
const latitude = (y: number) => Math.atan(Math.sinh(Math.PI * (1 - 2 * y / size))) * 180 / Math.PI;
const around = (x: number) => [longitude(x - 3), latitude(101), longitude(x + 3), latitude(100)];

function png(pixel: (x: number) => number[]) {
  const rows = Buffer.alloc(size * (1 + 4 * size));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) rows.set(pixel(x), y * (4 * size + 1) + 1 + x * 4);
  }
  return tilePng(rows, 4);
}

const temperature = png(x => x <= 120 ? [0, 255, 0, 255] : [1, 0, 0, 255]);
const wind = png(x => x <= 121 ? [0, 255, 0, 255] : [0, 0, 0, 0]);
const humidity = png(x => x <= 121 ? [0, 0, 0, 255] : [0, 0, 0, 0]);
const heat = { parameter: 'temperature', unit: '°C', unscale: [0, 65535] };
const moisture = { parameter: 'relative_humidity', unit: '%', unscale: [0, 100] };
const channel = { unit: 'm/s', unscale: [-50, 50] };

const fixtures = [
  { id: 'temp', preset: 'temp-2m', filename: 'temperature.tif', png: temperature, bounds: around(121), layer: {
    profile: 'rg-encoded-16bit', encoding: 'rg-linear-16bit',
    channels: { R: { ...heat, byteRole: 'high' }, G: { ...heat, byteRole: 'low' } },
  } },
  { id: 'wind', preset: 'wind-surface', filename: 'wind.tif', png: wind, bounds: around(121.75), layer: {
    profile: 'rg-encoded', encoding: 'rg-linear-8bit',
    channels: { R: { ...channel, parameter: 'eastward_wind' }, G: { ...channel, parameter: 'northward_wind' } },
  } },
  { id: 'hum', preset: 'rh-2m', filename: 'humidity-valid.tif', png: humidity, bounds: around(121.75), layer: {
    profile: 'r-encoded', encoding: 'r-linear-8bit', channels: { R: moisture, G: null },
  } },
  { id: 'mask', preset: 'rh-2m', filename: 'humidity-mask.tif', png: humidity, bounds: around(122.25), layer: {
    profile: 'r-encoded', encoding: 'r-linear-8bit', channels: { R: moisture, G: null },
  } },
];

test.use({ locale: 'en-US', launchOptions: { args: ['--enable-unsafe-swiftshader'] } });

test('encoded preview uses TileJSON units and does not blend packed bytes or NoData', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/status', route => route.fulfill({ json: { version: 'test', workerOnline: true, tools: {}, freeBytes: 0, basemapUrl: '' } }));
  await page.route('**/api/jobs', route => route.fulfill({ json: fixtures.map(fixture => ({
    id: fixture.id, filename: fixture.filename, status: 'SUCCEEDED', stage: 'Completed', size: fixture.png.length, attempt: 1,
    created: '2026-01-01T00:00:00Z', metadata: { kind: 'encoded-raster', bounds: fixture.bounds },
    options: { pipeline: 'scientific', scientificOutput: 'encoded-tiles', minZoom: 0, maxZoom: 0 },
  })) }));
  for (const fixture of fixtures) {
    await page.route(`**/api/jobs/${fixture.id}/tilejson`, route => route.fulfill({ json: {
      scheme: 'xyz', tileSize: size, minzoom: 0, maxzoom: 0, bounds: fixture.bounds,
      tiles: [`/api/jobs/${fixture.id}/tiles/{z}/{x}/{y}`],
      raster_layers: [{ id: fixture.preset, ...fixture.layer, tileFormat: 'image/png', channels: { ...fixture.layer.channels, A: 'nodata-mask' } }],
    } }));
    await page.route(`**/api/jobs/${fixture.id}/tiles/0/0/0`, route => route.fulfill({ contentType: 'image/png', body: fixture.png }));
  }
  await page.goto('/');
  const value = page.getByLabel('Encoded raster sample');
  const legend = page.getByRole('group', { name: 'Encoded raster legend' });
  const map = page.locator('#map');
  const openAndSample = async (filename: string, id: string) => {
    const response = page.waitForResponse(r => r.url().endsWith(`/api/jobs/${id}/tiles/0/0/0`) && r.ok());
    await page.locator('article.job').filter({ hasText: filename }).getByRole('button', { name: 'Open preview', exact: true }).click();
    await response;
    await expect(value).toBeVisible();
    const box = (await map.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    // Click also supports inspection on touch devices.
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  };
  const renderedPixel = async () => {
    const png = await map.screenshot();
    return page.evaluate(async data => {
      const img = new Image();
      img.src = data;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      return [...ctx.getImageData(Math.floor(img.width / 2), Math.floor(img.height / 2), 1, 1).data];
    }, `data:image/png;base64,${png.toString('base64')}`);
  };
  await openAndSample('temperature.tif', 'temp');
  await expect(value).toContainText('°C');
  const Celsius = Number((await value.innerText()).match(/([\d.]+) °C/)?.[1]);
  expect(Celsius).toBeCloseTo(255.5, 2);
  await expect(legend).toContainText('Temperature at 2 m');
  const temperatureRamp = await legend.locator('.encoded-preview-ramp').evaluate(el => getComputedStyle(el).backgroundImage);
  expect(temperatureRamp).toContain('rgb(37, 52, 148)');

  await openAndSample('wind.tif', 'wind');
  await expect(legend).toContainText('Wind speed');
  await expect(legend.locator('.encoded-preview-ticks span')).toHaveText(['0', '17.68', '70.71']);
  await expect(value).toContainText('Wind speed: 70.71 m/s');
  await expect(value).toContainText('U · eastward wind: -50 m/s');
  await expect(value).toContainText('V · northward wind: 50 m/s');

  await openAndSample('humidity-valid.tif', 'hum');
  await expect(value).toHaveText('relative humidity: 0 %');
  await expect(legend).toContainText('Relative humidity');
  await expect(legend.locator('.encoded-preview-ticks span')).toHaveText(['0', '50', '100']);
  await expect(legend.locator('.encoded-preview-ramp')).toHaveCSS('background-image', /rgb\(206, 120, 68\)/);
  await expect.poll(renderedPixel).toEqual([206, 120, 68, 255]);

  await openAndSample('humidity-mask.tif', 'mask');
  await expect(value).toHaveText('NoData');
  await expect.poll(renderedPixel).toEqual([11, 19, 30, 255]);

  await page.locator('#btn-clear-preview').click();
  await expect(value).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('worker tiles open as physical temperature and wind values', async ({ page, request }) => {
  test.skip(process.env.TILEO_INTEGRATION !== '1', 'Requires a running TileO worker and GDAL.');
  const dir = await mkdtemp(join(tmpdir(), 'tileo-encoded-preview-fixture-'));
  const ids: string[] = [];
  try {
    const fixtureModule = new URL('../../dist/tests/encoded-fixture.js', import.meta.url).href;
    await promisify(execFile)(process.execPath, ['--input-type=module', '-e',
      'const { cogFixture } = await import(process.argv[1]); await cogFixture(process.argv[2]);',
      fixtureModule, dir], { timeout: 30000 });
    const multiband = await readFile(join(dir, 'multiband.tif'));
    for (const { preset, bands } of [{ preset: 'temp-2m', bands: [1] }, { preset: 'wind-surface', bands: [3, 4] }]) {
      const filename = `preview-${preset}-${Date.now()}.tif`;
      await page.goto('/');
      await page.locator('#file').setInputFiles({ name: filename, mimeType: 'image/tiff', buffer: multiband });
      await expect(page.getByLabel('Raster purpose')).toHaveValue('encoded');
      await page.getByLabel('Encoding preset').selectOption(preset);
      await expect(page.locator('#encoded-band')).toHaveValue(String(bands[0]));
      if (bands.length === 2) await expect(page.getByLabel('V band (northward)')).toHaveValue(String(bands[1]));
      await page.getByLabel('Minimum zoom').fill('1');
      await page.getByLabel('Maximum zoom').fill('1');
      const created = page.waitForResponse(response => new URL(response.url()).pathname === '/api/jobs' && response.request().method() === 'POST');
      await page.getByRole('button', { name: 'Create tile job' }).click();
      const submitted = await created;
      expect(submitted.status(), await submitted.text()).toBe(202);
      ids.push((await submitted.json()).id);
      const card = page.locator('article.job').filter({ hasText: filename });
      await expect(card.locator('.badge')).toHaveText('SUCCEEDED', { timeout: 30000 });
      await card.getByRole('button', { name: 'Open preview', exact: true }).click();
      const value = page.getByLabel('Encoded raster sample');
      await expect(value).toBeVisible();
      const box = (await page.locator('#map').boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      if (preset === 'temp-2m') {
        await expect(value).toContainText('°C');
        const decoded = Number((await value.innerText()).match(/([\d.]+) °C/)?.[1]);
        expect(Math.abs(decoded - 26.85)).toBeLessThan(105 / 65535 / 2 + 1e-6);
      } else {
        await expect(value).toContainText('U · eastward wind: -50 m/s');
        await expect(value).toContainText('V · northward wind: 50 m/s');
      }
      await page.locator('#btn-clear-preview').click();
    }
  } finally {
    await Promise.all(ids.map(id => request.delete(`/api/jobs/${id}`)));
    await rm(dir, { recursive: true, force: true });
  }
});

test('preset choices follow compatible band names, units, and distinct U/V roles', async ({ page, request }, testInfo) => {
  const iconFile = process.env.TILEO_TEST_ICON_COG;
  if (!iconFile) {
    await page.route('**/api/inspect?*', route => route.fulfill({ json: { inspectionId: 'icon-fixture', inspection: {
      kind: 'raster', crs: 'EPSG:4326', cog: true, bands: 8, nativeZoom: 4, width: 512, height: 192,
      encodedBands: [
        ['eastward_wind_10m', 'm/s'], ['northward_wind_10m', 'm/s'], ['air_temperature_2m', 'degC'],
        ['relative_humidity_2m', '%'], ['precipitation_rate_water_equivalent', 'mm/h'],
        ['convective_available_potential_energy_ml', 'J/kg'], ['total_cloud_cover', '%'],
        ['t_2m', 'K'],
      ].map(([description, unit], i) => ({ index: i + 1, description, unit, type: 'Float32', scale: 1, offset: 0 })),
    } } }));
  }
  await page.goto('/');
  await page.locator('#file').setInputFiles(iconFile ?? { name: 'icon-fixture.tif', mimeType: 'image/tiff', buffer: Buffer.from('mock') });
  await expect(page.getByLabel('Raster purpose')).toHaveValue('encoded');
  const preset = page.getByLabel('Encoding preset');
  const first = page.locator('#encoded-band'), v = page.getByLabel('V band (northward)');
  await expect(preset.locator('option')).toHaveCount(6);
  await expect(preset.locator('option[value="ocean-currents"]')).toHaveCount(0);
  await preset.selectOption('temp-2m');
  await expect(first).toHaveValue(iconFile ? '3' : '');
  await expect(first.locator('option')).toHaveCount(iconFile ? 2 : 3);
  await expect(v).toBeHidden();
  await preset.selectOption('wind-surface');
  await expect(first).toHaveValue('1');
  await expect(v).toHaveValue('2');
  await expect(first.locator('option[value="2"]')).toHaveCount(0);
  await expect(page.locator('#encoded-preset-note')).toContainText('-50 to 50 m/s');
  await preset.selectOption('cloud-cover');
  await expect(first).toHaveValue('7');
  await expect(first.locator('option[value="4"]')).toHaveCount(0);
  await preset.selectOption('rh-2m');
  await expect(first).toHaveValue('4');
  await expect(v).toBeHidden();

  if (iconFile && process.env.TILEO_INTEGRATION === '1') {
    await preset.selectOption('wind-surface');
    await page.getByLabel('Maximum zoom').fill('4');
    const created = page.waitForResponse(response => new URL(response.url()).pathname === '/api/jobs' && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Create tile job' }).click();
    const submitted = await created;
    expect(submitted.status(), await submitted.text()).toBe(202);
    const job = await submitted.json() as { id: string; filename: string };
    try {
      const card = page.locator('article.job').filter({ hasText: job.filename });
      await expect(card.locator('.badge')).toHaveText('SUCCEEDED', { timeout: 30000 });
      await card.getByRole('button', { name: 'Open preview', exact: true }).click();
      const legend = page.getByRole('group', { name: 'Encoded raster legend' });
      await expect(legend).toContainText('Wind speed');
      const map = page.locator('#map');
      const box = (await map.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await expect(page.getByLabel('Encoded raster sample')).toContainText('Wind speed:');
      await map.screenshot({ path: testInfo.outputPath('icon-wind-legend.png') });
      await page.locator('#btn-clear-preview').click();
    } finally {
      await request.delete(`/api/jobs/${job.id}`);
    }
  }
});
