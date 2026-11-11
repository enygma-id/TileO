import { test, expect } from '@playwright/test';

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
  const model = { asset: { version: '2.0', extras: { location: { crs: 'EPSG:4979', latitude: -5.147, longitude: 119.433, height: 10 } } }, buffers: [{ byteLength: 36 }], bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }], accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [20, 0, 20] }], materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.9, 0.1, 0.1, 1] }, doubleSided: true }], meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }], nodes: Array.from({ length: 9 }, (_, i) => ({ mesh: 0, translation: [(i % 3) * 30, 0, Math.floor(i / 3) * 30] })), scenes: [{ nodes: Array.from({ length: 9 }, (_, i) => i) }], scene: 0 };
  const raw = JSON.stringify(model); const json = Buffer.from(raw.padEnd(Math.ceil(raw.length / 4) * 4, ' '));
  const bin = Buffer.alloc(36); for (const [i, value] of [0, 0, 0, 0, 0, 20, 20, 0, 0].entries()) bin.writeFloatLE(value, i * 4);
  const header = Buffer.alloc(28); header.write('glTF', 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + json.length + bin.length, 8); header.writeUInt32LE(json.length, 12); header.write('JSON', 16); header.writeUInt32LE(bin.length, 20); header.write('BIN\0', 24);
  const filename = `browser-3d-${Date.now()}.glb`;
  await page.locator('#file').setInputFiles({ name: filename, mimeType: 'model/gltf-binary', buffer: Buffer.concat([header.subarray(0, 20), json, header.subarray(20), bin]) });
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
