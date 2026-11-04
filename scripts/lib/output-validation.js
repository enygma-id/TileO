import { readFile, writeFile, mkdir, stat, readdir, open } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { join, resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { createReadStream } from 'node:fs';
import { PMTiles } from 'pmtiles';

const root = fileURLToPath(new URL('../../', import.meta.url));
const isolated = createRequire(join(root, 'tools/output-validation/package.json'));
export const toolDirectory = () => resolve(process.env.TILEO_VALIDATOR_TOOLS_DIR || join(root, 'artifacts/output-validators'));

export async function validateArtifact({ input, kind, report, tools = toolDirectory(), reference }) {
  input = resolve(input); report = resolve(report);
  await mkdir(dirname(report), { recursive: true });
  const checks = [];
  const check = async (name, action) => {
    try { const details = await action(); checks.push({ name, status: 'passed', details }); }
    catch (error) { checks.push({ name, status: 'failed', error: error.message }); }
  };
  const execute = (command, args, log) => {
    const result = spawnSync(command, args, { encoding: 'utf8', timeout: 180_000, maxBuffer: 16 * 1024 ** 2 });
    if (log) return writeFile(log, `${result.stdout ?? ''}\n${result.stderr ?? ''}`).then(() => { if (result.status !== 0) throw new Error(`${basename(command)} failed (${result.status}): ${result.error?.message || result.stderr || result.stdout}`); return result.stdout; });
    if (result.status !== 0) throw new Error(`${basename(command)} failed (${result.status}): ${result.error?.message || result.stderr || result.stdout}`);
    return result.stdout;
  };
  const raster = async (path, type, name, encoding) => check(name, async () => {
    const args = [join(root, 'scripts/lib/output-raster.py'), '--input', path, '--kind', type, '--report-dir', `${report}.files/${name}`];
    if (type === 'cog') args.push('--ets', join(tools, 'ets-geotiff11-1.2-aio.jar'));
    if (reference && type === 'cog') args.push('--reference', reference);
    if (encoding) args.push('--encoding', encoding);
    return JSON.parse(execute(process.env.PYTHON || 'python3', args));
  });
  const mvt = async path => check('mvt-payloads', async () => {
    const { VectorTile } = isolated('@mapbox/vector-tile');
    const { PbfReader } = await import('pbf');
    const db = new Database(path, { readonly: true, fileMustExist: true });
    let tiles = 0, features = 0;
    const ids = new Set();
    const maximumZoom = db.prepare('SELECT max(zoom_level) z FROM tiles').get()?.z;
    try {
      for (const row of db.prepare('SELECT zoom_level z,tile_data data FROM tiles').iterate()) {
        const bytes = row.data[0] === 31 && row.data[1] === 139 ? gunzipSync(row.data, { maxOutputLength: 64 * 1024 ** 2 }) : row.data;
        const tile = new VectorTile(new PbfReader(bytes)); tiles++;
        for (const layer of Object.values(tile.layers)) {
          if (layer.version !== 2 || !Number.isFinite(layer.extent) || layer.extent <= 0) throw new Error('Invalid MVT layer');
          for (let i = 0; i < layer.length; i++) {
            const feature = layer.feature(i), geometry = feature.loadGeometry(); features++;
            if (row.z === maximumZoom) ids.add(String(feature.properties.id ?? feature.id));
            if (![1, 2, 3].includes(feature.type) || !geometry.length || geometry.some(ring => ring.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y)))) throw new Error('Invalid MVT geometry');
          }
        }
      }
      if (reference) {
        const source = JSON.parse(await readFile(reference, 'utf8'));
        if (!Array.isArray(source.features) || source.features.some(f => !ids.has(String(f.properties?.id ?? f.id)))) throw new Error('Source feature IDs missing at maximum zoom');
      }
      return { tiles, features, uniqueIdsAtMaximumZoom: ids.size };
    } finally { db.close(); }
  });
  const pmtiles = async (path, mbtiles) => check('pmtiles-' + basename(path), async () => {
    await execute(join(tools, 'pmtiles'), ['verify', path], `${report}.${basename(path)}.log`);
    const file = await open(path, 'r');
    try {
      const archive = new PMTiles({ getKey: () => path, async getBytes(offset, length) { const bytes = Buffer.alloc(length), r = await file.read(bytes, 0, length, offset); return { data: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + r.bytesRead) }; } });
      const header = await archive.getHeader(); await archive.getMetadata(); let compared = 0;
      if (mbtiles) {
        const db = new Database(mbtiles, { readonly: true, fileMustExist: true });
        try {
          const format = db.prepare("SELECT value FROM metadata WHERE name='format'").get()?.value;
          for (const row of db.prepare('SELECT zoom_level z,tile_column x,tile_row y,tile_data data FROM tiles').iterate()) {
            const tile = await archive.getZxy(row.z, row.x, 2 ** row.z - 1 - row.y);
            const expected = format === 'pbf' && row.data[0] === 31 && row.data[1] === 139 ? gunzipSync(row.data, { maxOutputLength: 64 * 1024 ** 2 }) : row.data;
            if (!tile || !Buffer.from(tile.data).equals(expected)) throw new Error(`Payload differs at ${row.z}/${row.x}/${row.y}`);
            compared++;
          }
          if (header.numAddressedTiles !== compared) throw new Error('PMTiles tile count differs from MBTiles');
        } finally { db.close(); }
      }
      return { tiles: header.numAddressedTiles, compared };
    } finally { await file.close(); }
  });
  const gltf = async path => check('gltf-' + basename(path), async () => {
    const validator = isolated('gltf-validator');
    const options = { uri: basename(path), externalResourceFunction: async uri => {
      const resource = resolve(dirname(path), uri);
      if (!resource.startsWith(dirname(path) + '/')) throw new Error('Resource escapes model directory');
      return new Uint8Array(await readFile(resource));
    } };
    const result = extname(path) === '.gltf' ? await validator.validateString(await readFile(path, 'utf8'), options) : await validator.validateBytes(new Uint8Array(await readFile(path)), options);
    await writeFile(`${report}.${basename(path)}.json`, JSON.stringify(result, null, 2));
    if (result.issues.numErrors) throw new Error(`Khronos Validator: ${result.issues.numErrors} errors`);
    return { errors: result.issues.numErrors, warnings: result.issues.numWarnings };
  });
  try {
    if (kind === 'glb' || kind === 'gltf') await gltf(input);
    else if (kind === 'pmtiles') await pmtiles(input, reference);
    else if (kind === 'model3d') {
      const { Validators } = isolated('3d-tiles-validator');
      for (const name of ['tileset.json', 'legacy-b3dm/tileset.json']) {
        if (name.startsWith('legacy') && !await stat(join(input, name)).catch(() => false)) continue;
        await check('cesium-' + (name.startsWith('legacy') ? '1.0' : '1.1'), async () => {
          const result = JSON.parse((await Validators.validateTilesetFile(join(input, name))).serialize());
          await writeFile(`${report}.${name.startsWith('legacy') ? 'cesium-1.0' : 'cesium-1.1'}.json`, JSON.stringify(result, null, 2));
          if (result.numErrors) throw new Error(`Cesium Validator: ${result.numErrors} errors`);
          return result;
        });
      }
    } else if (kind === 'elevation' || kind === 'scientific') {
      const directory = (await stat(input)).isDirectory() ? input : dirname(input);
      await raster((await stat(input)).isDirectory() ? join(input, kind === 'scientific' ? 'scientific.tif' : 'elevation.tif') : input, 'cog', 'cog');
      const terrain = join(directory, 'terrain.mbtiles');
      if (await stat(terrain).catch(() => false)) {
        const manifest = JSON.parse(await readFile(join(directory, 'manifest.json')));
        await raster(terrain, 'mbtiles', 'terrain', manifest.format);
        if (await stat(join(directory, 'terrain.pmtiles')).catch(() => false)) await pmtiles(join(directory, 'terrain.pmtiles'), terrain);
      }
    } else if (kind === 'raster' || kind === 'vector') {
      const directory = (await stat(input)).isDirectory();
      const archive = directory ? join(input, 'tiles.mbtiles') : input;
      await raster(archive, 'mbtiles', 'mbtiles');
      if (kind === 'vector') await mvt(archive);
      if (directory && await stat(join(input, 'tiles.pmtiles')).catch(() => false)) await pmtiles(join(input, 'tiles.pmtiles'), archive);
    } else throw new Error(`Unsupported output kind: ${kind}`);
  } catch (error) { checks.push({ name: 'validator-setup', status: 'failed', error: error.message }); }
  const result = { schema: 'tileo-output-validation@1', profile: 'strict', status: checks.length && checks.every(c => c.status === 'passed') ? 'passed' : 'failed', artifact: basename(input), kind, checks };
  if ((await stat(input)).isFile()) {
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(input)) hash.update(chunk);
    result.sha256 = hash.digest('hex');
  }
  await writeFile(report, JSON.stringify(result, null, 2) + '\n');
  return result;
}
