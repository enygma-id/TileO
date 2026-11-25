import { test, expect } from '@playwright/test';
import { buffer } from 'node:stream/consumers';
import { ZipFile } from 'yazl';

function fixtureGlb() {
  const model = { asset: { version: '2.0', extras: { location: { crs: 'EPSG:4979', latitude: -5.147, longitude: 119.433, height: 10 } } }, buffers: [{ byteLength: 36 }], bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }], accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [20, 0, 20] }], materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.9, 0.1, 0.1, 1] }, doubleSided: true }], meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }], nodes: Array.from({ length: 9 }, (_, i) => ({ mesh: 0, translation: [(i % 3) * 30, 0, Math.floor(i / 3) * 30] })), scenes: [{ nodes: Array.from({ length: 9 }, (_, i) => i) }], scene: 0 };
  const raw = JSON.stringify(model); const json = Buffer.from(raw.padEnd(Math.ceil(raw.length / 4) * 4, ' '));
  const bin = Buffer.alloc(36); for (const [i, value] of [0, 0, 0, 0, 0, 20, 20, 0, 0].entries()) bin.writeFloatLE(value, i * 4);
  const header = Buffer.alloc(28); header.write('glTF', 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + json.length + bin.length, 8); header.writeUInt32LE(json.length, 12); header.write('JSON', 16); header.writeUInt32LE(bin.length, 20); header.write('BIN\0', 24);
  return Buffer.concat([header.subarray(0, 20), json, header.subarray(20), bin]);
}

test('GLB metadata accepts more than 16 MiB and explains the 64 MiB limit', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const response = await page.request.get('/glb-limits.js');
  expect(response.status()).toBe(200);
  await page.evaluate(() => {
    const jsonSize = 17 * 1024 ** 2;
    const json = JSON.stringify({ asset: { version: '2.0', extras: {
      location: { crs: 'EPSG:4979', latitude: -5.147, longitude: 119.433, height: 10 },
    } } }).padEnd(jsonSize, ' ');
    const header = new Uint32Array([0x46546c67, 2, 28 + jsonSize + 4, jsonSize, 0x4e4f534a]);
    const file = new File([header, json, new Uint32Array([4, 0x004e4942]), new Uint8Array(4)], 'large-metadata.glb');
    const input = document.querySelector<HTMLInputElement>('#file')!;
    const data = new DataTransfer(); data.items.add(file); input.files = data.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.locator('#model-location-note')).toContainText('Placement loaded from declared WGS84 metadata');
  await expect(page.locator('#model-latitude')).toHaveValue('-5.1470000');
  await page.evaluate(() => {
    const jsonSize = 64 * 1024 ** 2 + 4;
    const header = new Uint32Array([0x46546c67, 2, 28 + jsonSize + 4, jsonSize, 0x4e4f534a]);
    const file = new File([header, new Uint8Array(jsonSize + 12)], 'oversized-metadata.glb');
    const input = document.querySelector<HTMLInputElement>('#file')!;
    const data = new DataTransfer(); data.items.add(file); input.files = data.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.locator('#model-location-note')).toContainText('the maximum is 64 MiB');
  expect(errors).toEqual([]);
});

test('GLB job creates a previewable 3D Tiles package', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#connection')).toContainText('Worker connected', { timeout: 30000 });
  const filename = `browser-3d-${Date.now()}.glb`;
  await page.locator('#file').setInputFiles({ name: filename, mimeType: 'model/gltf-binary', buffer: fixtureGlb() });
  await expect(page.locator('#model3d-options-group')).toBeVisible();
  await expect(page.locator('#vector-options-group')).toBeHidden();
  await expect(page.locator('#raster-options-group')).toBeHidden();
  await expect(page.locator('#model-location-note')).toContainText('Placement loaded from declared WGS84 metadata');
  await expect(page.locator('#model-latitude')).toHaveValue('-5.1470000');
  await expect(page.locator('#model-longitude')).toHaveValue('119.4330000');
  await expect(page.locator('#model-height')).toHaveValue('10');
  await page.getByRole('button', { name: 'Create tile job' }).click();
  const job = page.locator('article.job').filter({ hasText: filename });
  await expect(job.locator('.badge')).toHaveText('SUCCEEDED', { timeout: 60000 });
  const modelResponse = page.waitForResponse(response => /\/3d\/tiles\/.+\.glb$/.test(response.url()));
  await job.getByRole('button', { name: 'Open preview', exact: true }).click();
  await expect(page.locator('#preview-name')).toHaveText(filename);
  await expect(page.locator('#loaded-data-info')).toContainText('3 tiles');
  await expect(page.locator('#loaded-data-info')).toContainText('2 LOD levels');
  await expect(page.locator('#loaded-data-info')).toContainText('deck.gl + MapLibre');
  await expect(page.locator('#map canvas')).toBeVisible({ timeout: 30000 });
  expect((await modelResponse).status()).toBe(200);
  await expect(page.locator('#preview-3d-dialog')).toHaveCount(0);
  await job.getByRole('button', { name: 'More actions' }).click();
  const compareItem = job.getByRole('menuitem', { name: 'Compare source' });
  if (await compareItem.count() > 0) {
    const originalModel = page.waitForResponse(response => /\/api\/jobs\/[^/]+\/source$/.test(response.url()));
    await compareItem.click();
    expect((await originalModel).status()).toBe(200);
    await expect(page.locator('.compare-control')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('.compare-label-source')).toContainText('GLB model');
    await page.locator('.compare-control').getByRole('button', { name: 'Close', exact: true }).click();
  }
  expect(errors).toEqual([]);
});

async function legacyPackage(uri = 'lod/root.b3dm') {
  const glb = fixtureGlb();
  const table = Buffer.from('{"BATCH_LENGTH":0}  ');
  const header = Buffer.alloc(28);
  header.write('b3dm');
  header.writeUInt32LE(1, 4);
  header.writeUInt32LE(header.length + table.length + glb.length, 8);
  header.writeUInt32LE(table.length, 12);
  const b3dm = Buffer.concat([header, table, glb]);
  const lon = 119.433 * Math.PI / 180, lat = -5.147 * Math.PI / 180;
  const sinLon = Math.sin(lon), cosLon = Math.cos(lon), sinLat = Math.sin(lat), cosLat = Math.cos(lat);
  const eccentricitySquared = 0.0066943799901413165;
  const radius = 6378137 / Math.sqrt(1 - eccentricitySquared * sinLat ** 2);
  const manifest = {
    asset: { version: '1.0' }, geometricError: 0,
    root: {
      boundingVolume: { region: [lon - 0.00002, lat - 0.00002, lon + 0.00002, lat + 0.00002, -10, 100] },
      transform: [
        -sinLon, cosLon, 0, 0,
        -cosLon * sinLat, -sinLon * sinLat, cosLat, 0,
        cosLon * cosLat, sinLon * cosLat, sinLat, 0,
        radius * cosLon * cosLat, radius * sinLon * cosLat, radius * (1 - eccentricitySquared) * sinLat, 1,
      ],
      geometricError: 0, refine: 'REPLACE', content: { url: uri },
    },
  };
  const zip = new ZipFile();
  zip.addBuffer(Buffer.from(JSON.stringify(manifest)), 'fixture/tileset.json');
  zip.addBuffer(b3dm, 'fixture/lod/root.b3dm');
  zip.end();
  return { archive: await buffer(zip.outputStream), b3dm, manifest };
}

test('B3DM archive imports through inspection and serves the source tile in preview', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#connection')).toContainText('Worker connected', { timeout: 30000 });
  const { archive, b3dm, manifest } = await legacyPackage();
  const filename = `browser-import-${Date.now()}.zip`;
  await page.locator('#file').setInputFiles({ name: filename, mimeType: 'application/zip', buffer: archive });
  await expect(page.locator('#tip-title')).toContainText('3D Tiles 1.0');
  await expect(page.locator('#tip-list')).toContainText('B3DM');
  for (const group of ['model3d-options-group', 'vector-options-group', 'raster-options-group']) {
    await expect(page.locator(`#${group}`)).toBeHidden();
  }
  await page.getByRole('button', { name: 'Create tile job' }).click();
  const job = page.locator('article.job').filter({ hasText: filename });
  await expect(job.locator('.badge')).toHaveText('SUCCEEDED', { timeout: 60000 });
  const manifestResponse = page.waitForResponse(response => response.url().endsWith('/3d/tileset.json'));
  const tileResponse = page.waitForResponse(response => response.url().endsWith('/3d/lod/root.b3dm'));
  await job.getByRole('button', { name: 'Open preview', exact: true }).click();
  expect(await (await manifestResponse).json()).toEqual(manifest);
  expect(await (await tileResponse).body()).toEqual(b3dm);
  await expect(page.locator('#map canvas')).toBeVisible();
  const download = job.getByRole('link', { name: 'Download 3D Tiles' });
  const downloadUrl = (await download.getAttribute('href'))!;
  expect(await (await page.request.get(downloadUrl)).body()).toEqual(archive);
});

test('3D Tiles archive inspection rejects missing content and gives guidance for a loose manifest', async ({ request }) => {
  const { archive, manifest } = await legacyPackage('lod/missing.b3dm');
  const headers = { 'Content-Type': 'application/octet-stream' };
  const missing = await request.post('/api/inspect?filename=missing.zip', { headers, data: archive });
  expect(missing.status()).toBe(400);
  expect((await missing.json()).error).toMatchObject({ code: 'INVALID_TILESET_ARCHIVE', message: expect.stringContaining('lod/missing.b3dm') });
  const loose = await request.post('/api/inspect?filename=tileset.json', { headers, data: Buffer.from(JSON.stringify(manifest)) });
  expect(loose.status()).toBe(400);
  expect((await loose.json()).error.message).toContain('Upload a ZIP');
});

test('imports and opens the supplied 3D Tiles 1.1 archive', async ({ page }) => {
  const fixture = process.env.TILEO_TEST_TILESET_ARCHIVE;
  test.skip(!fixture, 'Set TILEO_TEST_TILESET_ARCHIVE to the local example ZIP.');
  await page.goto('/');
  await expect(page.locator('#connection')).toContainText('Worker connected', { timeout: 30000 });
  await page.locator('#file').setInputFiles(fixture!);
  await expect(page.locator('#tip-title')).toContainText('3D Tiles 1.1', { timeout: 30000 });
  await expect(page.locator('#tip-list')).toContainText('175 tiles · 3 LOD levels');
  await page.getByRole('button', { name: 'Create tile job' }).click();
  const job = page.locator('article.job').filter({ hasText: '3dtiles-1.1.zip' }).first();
  await expect(job.locator('.badge')).toHaveText('SUCCEEDED', { timeout: 60000 });
  const tileResponse = page.waitForResponse(response => /\/3d\/tiles\/.+\.glb$/.test(new URL(response.url()).pathname) && response.ok());
  await job.getByRole('button', { name: 'Open preview', exact: true }).click();
  await expect(page.locator('#loaded-data-info')).toContainText('175 tiles');
  await expect(page.locator('#map canvas')).toBeVisible();
  expect((await tileResponse).ok()).toBe(true);
});

test('external tilesets are recognized and independent roots list their paths', async ({ request }) => {
  const { b3dm, manifest } = await legacyPackage();
  const legacy = { ...manifest, asset: { version: '0.0', gltfUpAxis: 'Z' } };
  async function inspectPackage(independent: boolean) {
    const zip = new ZipFile();
    const first = independent ? legacy : { ...legacy, root: { ...legacy.root, content: { url: 'block/tileset.json' } } };
    zip.addBuffer(Buffer.from(JSON.stringify(first)), 'main/tileset.json');
    zip.addBuffer(Buffer.from(JSON.stringify(legacy)), independent ? 'other/tileset.json' : 'main/block/tileset.json');
    zip.addBuffer(b3dm, 'main/block/lod/root.b3dm');
    zip.end();
    return request.post('/api/inspect?filename=external.zip', {
      headers: { 'Content-Type': 'application/octet-stream' }, data: await buffer(zip.outputStream),
    });
  }
  const nested = await inspectPackage(false);
  expect(nested.status()).toBe(200);
  expect((await nested.json()).inspection).toMatchObject({ entrypoint: 'main/tileset.json', manifests: 2, contentFiles: 1 });
  const ambiguous = await inspectPackage(true);
  expect(ambiguous.status()).toBe(400);
  const { error } = await ambiguous.json();
  expect(error.message).toContain('main/tileset.json, other/tileset.json');
  expect(error.message).toContain('Upload one package per ZIP');
});
