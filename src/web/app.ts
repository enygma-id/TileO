import type { Job } from '../types.js';
import { iconElement } from './icons.js';
import { fitBoundsZoom, landingSampleBounds, landingSampleData, landingSampleText, type LandingSample } from './landing-sample.js';
import { propertiesHtml } from './popup.js';
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const field = (id: string) => element<HTMLInputElement>(id).value;
let uploading: XMLHttpRequest | undefined;
let map: import('maplibre-gl').Map | undefined;
let signedIn = true;
let lastJobs = '';
let allJobs: Job[] = [];
// Fail closed until /api/status explicitly confirms that this is a local,
// writable instance. This prevents the native file chooser opening during
// the initial status request on hosted production.
let productionReadOnly = true;
let repositoryUrl = 'https://github.com';
let pendingDownload: { url: string; name: string } | undefined;
let jobPage = 1;
const jobsPerPage = 6;
let noticeTimer: ReturnType<typeof setTimeout> | undefined;
function pauseNotice() { clearTimeout(noticeTimer); }
function dismissNoticeLater() {
  pauseNotice();
  const toast = element('notice');
  if (!toast.hidden && !toast.matches(':hover') && !toast.contains(document.activeElement)) {
    noticeTimer = setTimeout(() => notice(), 6000);
  }
}
function notice(message = '') {
  const toast = element('notice');
  // Repeated polling errors must not keep resetting the dismissal timer.
  if (!toast.hidden && element('notice-message').textContent === message) return;
  pauseNotice();
  element('notice-message').textContent = message;
  toast.hidden = !message;
  if (message) dismissNoticeLater();
}
element('notice-close').addEventListener('click', () => notice());
element('notice').addEventListener('mouseenter', pauseNotice);
element('notice').addEventListener('mouseleave', dismissNoticeLater);
element('notice').addEventListener('focusin', pauseNotice);
element('notice').addEventListener('focusout', () => queueMicrotask(dismissNoticeLater));
function showProductionDialog() {
  const command = `git clone ${repositoryUrl}`;
  element('clone-command').textContent = command;
  const link = element<HTMLAnchorElement>('open-repository');
  link.href = repositoryUrl;
  element<HTMLDialogElement>('production-dialog').showModal();
}
function lockProductionDatasetPicker() {
  const input = element<HTMLInputElement>('file');
  if (uploading) uploading.abort();
  input.value = ''; input.disabled = true;
  selectedInspection = undefined; inspectionId = undefined;
  element<HTMLButtonElement>('source-upload-tab').disabled = true;
  element<HTMLButtonElement>('source-s3-tab').disabled = true;
  updateSelectedFile(); updateDatasetFormState();
  const picker = element('dataset-picker'); picker.classList.add('production-locked');
  picker.querySelector('strong')!.textContent = 'Clone TileO to choose a dataset';
  const description = picker.querySelector('span:not(.file-icon)');
  if (description) description.textContent = 'Production is preview-only. Run TileO locally to create tiles.';
  element<HTMLButtonElement>('submit').disabled = false;
}
function unlockLocalDatasetPicker() {
  const input = element<HTMLInputElement>('file'); input.disabled = false;
  element<HTMLButtonElement>('source-upload-tab').disabled = false;
  const picker = element('dataset-picker'); picker.classList.remove('production-locked');
  picker.querySelector('strong')!.textContent = 'Choose a dataset';
  const description = picker.querySelector('span:not(.file-icon)');
  if (description) description.innerHTML = 'GeoTIFF, GeoJSON, GeoPackage, Shapefile (.zip),<br>FlatGeobuf, or 3D model (.glb)';
  const submit = element<HTMLButtonElement>('submit');
  submit.innerHTML = 'Create tile job <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /> <path d="m10 8 4 4-4 4" /></svg>';
  submit.title = '';
}
element('dataset-picker').addEventListener('click', event => {
  if (!productionReadOnly) return;
  event.preventDefault(); showProductionDialog();
});
element('close-production-dialog').addEventListener('click', () => element<HTMLDialogElement>('production-dialog').close());
element('copy-clone-command').addEventListener('click', async () => {
  await navigator.clipboard.writeText(element('clone-command').textContent ?? '');
  element('copy-clone-command').textContent = 'Copied';
});
let landingSample: LandingSample | null = null;
let landingJob: Job | null = null;
let landingSyncFrame = 0;
let landingSyncMap: import('maplibre-gl').Map | null = null;
let landingSyncHandler: (() => void) | null = null;
element('close-landing-dialog').addEventListener('click', () => element<HTMLDialogElement>('landing-dialog').close());
element<HTMLDialogElement>('landing-dialog').addEventListener('close', () => {
  stopLandingSync();
  landingSample = null;
  landingJob = null;
});
element<HTMLDialogElement>('landing-dialog').addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;
  event.preventDefault();
  element<HTMLDialogElement>('landing-dialog').close();
});
element('copy-landing-sample').addEventListener('click', async () => {
  const snippet = element<HTMLTextAreaElement>('landing-snippet');
  const status = element('landing-status');
  try {
    await navigator.clipboard.writeText(snippet.value);
    status.textContent = 'SAMPLE copied to clipboard.';
  } catch {
    element<HTMLDetailsElement>('landing-code').open = true;
    snippet.focus(); snippet.select();
    status.textContent = 'Clipboard unavailable — the snippet is selected; press Ctrl+C.';
  }
});
element('copy-landing-url').addEventListener('click', async () => {
  if (!landingSample) return;
  const status = element('landing-status');
  try {
    await navigator.clipboard.writeText(new URL(landingSample.url, location.origin).href);
    status.textContent = 'Tile URL copied to clipboard.';
  } catch {
    status.textContent = 'Clipboard unavailable — copy the URL from the properties above.';
  }
});
function bytes(value: number) { return value >= 1024 ** 3 ? `${(value / 1024 ** 3).toFixed(2)} GB` : `${(value / 1024 ** 2).toFixed(1)} MB`; }
function fmtSize(value: number) {
  if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(2)} GB`;
  if (value >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(1)} MB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KB`;
  return `${Math.round(value)} B`;
}
function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes}m ${String(total % 60).padStart(2, '0')}s`;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}
function etaText(job: Job) {
  if (typeof job.elapsedMs !== 'number') return '';
  const elapsed = `Elapsed ${formatDuration(job.elapsedMs)}`;
  if (typeof job.remainingMs !== 'number') return `${elapsed} · estimating time left…`;
  if (job.remainingMs <= 5000) return `${elapsed} · almost done…`;
  return `${elapsed} · ≈${formatDuration(job.remainingMs)} left`;
}
async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, init);
  if (response.status === 401) { signedIn = false; const dialog = element<HTMLDialogElement>('sign-in'); if (!dialog.open) dialog.showModal(); element('sign-out').hidden = true; queueMicrotask(() => element<HTMLInputElement>('access-token').focus()); throw new Error('Sign in to access the console.'); }
  if (!response.ok) { const data = await response.json(); throw new Error(data.error?.message ?? `Request failed (${response.status})`); }
  return response;
}
element('login-form').addEventListener('submit', async event => {
  event.preventDefault();
  try { await api('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: field('access-token') }) }); signedIn = true; element<HTMLInputElement>('access-token').value = ''; element<HTMLDialogElement>('sign-in').close(); notice(); await refresh(); }
  catch (error) { notice(String(error)); }
});
element('sign-out').addEventListener('click', async () => {
  try {
    await api('/api/session/logout', { method: 'POST' });
    signedIn = false;
    element('sign-out').hidden = true;
    const dialog = element<HTMLDialogElement>('sign-in'); if (!dialog.open) dialog.showModal();
    notice('Signed out.');
    element<HTMLInputElement>('access-token').focus();
  } catch (error) { notice(error instanceof Error ? error.message : String(error)); }
});
element('sign-in').addEventListener('cancel', event => event.preventDefault());

function safeDownloadBase(filename: string) {
  return filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._ -]+/g, '-').replace(/^[. ]+|[. ]+$/g, '') || 'tileo-result';
}
function primaryDownloadName(job: Job) {
  const base = safeDownloadBase(job.filename);
  if (job.metadata?.kind === 'model3d') return `${base}-3dtiles.zip`;
  if (job.metadata?.kind === 'scientific') return `${base}-scientific.tif`;
  if (job.metadata?.kind === 'elevation') return job.options.elevationOutput === 'cog' ? `${base}-elevation.tif` : `${base}-elevation.zip`;
  return job.options.exportPmtiles ? `${base}-tiles.zip` : `${base}.mbtiles`;
}
function askDownload(url: string, name: string) {
  pendingDownload = { url, name };
  element<HTMLInputElement>('download-filename').value = name;
  const dialog = element<HTMLDialogElement>('download-dialog'); dialog.showModal();
  queueMicrotask(() => { const input = element<HTMLInputElement>('download-filename'); input.focus(); input.select(); });
}
element('close-download-dialog').addEventListener('click', () => element<HTMLDialogElement>('download-dialog').close());
element('download-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!pendingDownload) return;
  const name = field('download-filename').trim();
  if (!name) return;
  const url = new URL(pendingDownload.url, location.origin); url.searchParams.set('name', name);
  const link = document.createElement('a'); link.href = `${url.pathname}${url.search}`; link.download = name; document.body.append(link); link.click(); link.remove();
  element<HTMLDialogElement>('download-dialog').close(); pendingDownload = undefined;
});
type RecommendedSettings = { minZoom?: number; maxZoom?: number; format?: string; quality?: number; preset?: string; engine?: string; includeProperties?: string[] | null } | null;
let recommendedSettings: RecommendedSettings = null;
let selectedInspection: FileInspection | undefined;
type DatasetRef = { name: string; size: number };
type RemoteDataset = DatasetRef & { source: ({ kind: 's3'; connectionId: string; bucket: string; key: string } | { kind: 'url'; url: string; auth: 'public' | 'presigned' }) & { readMode: 'remote' | 'stage'; size: number; etag: string; rangeSupported: boolean; cog: boolean } };
let inputSourceMode: 'upload' | 's3' = 'upload';
let remoteDataset: RemoteDataset | undefined;

function updateDatasetFormState(file?: DatasetRef, detectedKind?: 'raster' | 'vector') {
  const vectorGroup = element('vector-options-group');
  const rasterGroup = element('raster-options-group');
  const modelGroup = element('model3d-options-group');
  const model3d = file?.name.toLowerCase().endsWith('.glb') ?? false;
  const candidate = !!file && !model3d && !!selectedInspection?.elevationCandidate;
  const elevation = candidate && field('raster-purpose') === 'elevation';
  const scientific = candidate && field('raster-purpose') === 'scientific';
  const terrain = elevation && field('elevation-output') !== 'cog';
  element('archive-options-group').hidden = !file || model3d || scientific || (elevation && !terrain);
  element<HTMLSelectElement>('export-pmtiles').disabled = !file || model3d || scientific || (elevation && !terrain);
  element<HTMLInputElement>('terrain-nodata-height').min = field('elevation-output') === 'terrarium' ? '-32768' : '-10000';
  element<HTMLInputElement>('terrain-nodata-height').max = field('elevation-output') === 'terrarium' ? '32767.99609375' : '1667721.5';
  element('raster-purpose-group').hidden = !candidate;
  const rasterPurpose = element<HTMLSelectElement>('raster-purpose');
  rasterPurpose.disabled = !candidate;
  rasterPurpose.required = candidate;
  element('elevation-options-group').hidden = !elevation;
  element('terrain-nodata-group').hidden = !terrain;
  for (const id of ['elevation-output', 'elevation-kind', 'elevation-unit', 'height-reference', 'terrain-nodata-height']) {
    const control = element<HTMLInputElement | HTMLSelectElement>(id);
    control.disabled = !elevation || (id === 'terrain-nodata-height' && !terrain);
    control.required = id === 'terrain-nodata-height' && terrain;
  }
  modelGroup.hidden = !model3d;
  element('zoom-options-group').hidden = !file || model3d || scientific || (elevation && !terrain);
  for (const id of ['min-zoom', 'max-zoom']) element<HTMLInputElement>(id).disabled = !file || model3d || scientific || (elevation && !terrain);
  element<HTMLInputElement>('quality').disabled = model3d || elevation || scientific || field('tile-format') === 'png';
  element('source-options-group').hidden = !file || model3d;
  for (const id of ['model-latitude', 'model-longitude', 'model-height', 'model-heading', 'model-pitch', 'model-roll', 'model-anchor', 'model-scale', 'model-b3dm']) {
    const input = element<HTMLInputElement | HTMLSelectElement>(id);
    input.disabled = !model3d;
    input.required = model3d && id !== 'model-heading';
  }

  if (!file) {
    vectorGroup.hidden = true;
    rasterGroup.hidden = true;
    return;
  }
  if (model3d) { vectorGroup.hidden = true; rasterGroup.hidden = true; return; }
  if (elevation || scientific) { vectorGroup.hidden = true; rasterGroup.hidden = true; return; }

  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  const isVector = detectedKind ? detectedKind === 'vector' : ['.geojson', '.json', '.geojsonl', '.gpkg', '.fgb', '.zip', '.kml'].includes(ext);
  vectorGroup.hidden = !isVector;
  rasterGroup.hidden = isVector;
  vectorGroup.classList.toggle('active-type', isVector);
  rasterGroup.classList.toggle('active-type', !isVector);
}

function metadataCoordinates(value: unknown, inheritedCrs = ''): { latitude: number; longitude: number; height?: number } | undefined {
  if (!value || typeof value !== 'object') return;
  const data = value as Record<string, unknown>;
  const number = (...keys: string[]) => {
    const key = Object.keys(data).find(name => keys.includes(name.toLowerCase()));
    const result = key ? Number(data[key]) : NaN;
    return Number.isFinite(result) ? result : undefined;
  };
  const crsKey = Object.keys(data).find(name => ['crs', 'srs', 'datum'].includes(name.toLowerCase()));
  const crs = crsKey ? String(data[crsKey]).toUpperCase().replaceAll(' ', '') : inheritedCrs;
  const recognizedCrs = ['EPSG:4979', 'EPSG4979', 'WGS84', 'WGS84/ELLIPSOID'].includes(crs);
  const latitude = number('latitude', 'lat'), longitude = number('longitude', 'lon', 'lng');
  if (recognizedCrs && latitude !== undefined && longitude !== undefined && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180)
    return { latitude, longitude, height: number('ellipsoidHeight', 'height', 'altitude', 'elevation') };
  for (const key of ['location', 'position', 'geolocation', 'georeference']) {
    const found = metadataCoordinates(data[key], crs);
    if (found) return found;
  }
}

async function readModelLocation(file: File): Promise<{ location?: { latitude: number; longitude: number; height?: number }; warning?: string; error?: string }> {
  const header = new DataView(await file.slice(0, 20).arrayBuffer());
  if (header.byteLength < 20 || header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2 || header.getUint32(8, true) !== file.size || header.getUint32(12, true) > Math.min(16 * 1024 ** 2, file.size - 20) || header.getUint32(16, true) !== 0x4e4f534a) return { error: 'GLB header or JSON metadata is invalid.' };
  const jsonSize = header.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(await file.slice(20, 20 + jsonSize).arrayBuffer()));
  const gltf = json as { extras?: unknown; asset?: { extras?: unknown }; extensions?: { CESIUM_RTC?: { center?: unknown } }; extensionsUsed?: string[]; nodes?: { skin?: number; extensions?: Record<string, unknown> }[]; skins?: unknown[]; meshes?: { primitives?: { targets?: unknown[] }[] }[] };
  if (gltf.extensionsUsed?.includes('KHR_draco_mesh_compression')) return { error: 'Draco-compressed GLB is not supported. Export with Meshopt or uncompressed geometry.' };
  if (gltf.nodes?.some(node => node.extensions?.EXT_mesh_gpu_instancing)) return { error: 'GPU instancing must be expanded to regular mesh nodes before tiling.' };
  if (gltf.skins?.length || gltf.nodes?.some(node => node.skin !== undefined) || gltf.meshes?.some(mesh => mesh.primitives?.some(primitive => primitive.targets?.length))) return { error: 'Skins and morph targets must be pre-baked before tiling.' };
  for (const metadata of [gltf.asset?.extras, gltf.extras]) {
    const location = metadataCoordinates(metadata);
    if (location) return { location };
  }
  if (gltf.extensions?.CESIUM_RTC?.center) return { warning: 'CESIUM_RTC was found, but its coordinate system is not declared. Enter WGS84 placement manually.' };
  return { warning: 'No EPSG:4979 or WGS84 ellipsoid location metadata found. Enter placement manually.' };
}

function updateSelectedFile(file?: DatasetRef) {
  element('file-info').hidden = !file;
  element('file-name').textContent = file?.name ?? '';
  element('file-size').textContent = file ? bytes(file.size) : '';
}

function applyRecommendationsForFile(file: DatasetRef) {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  const sizeMB = file.size / (1024 * 1024);
  const tipBox = element('tip-box');
  const tipTitle = element('tip-title');
  const tipList = element('tip-list');
  const btnApply = element<HTMLButtonElement>('btn-apply-rec');

  tipBox.hidden = false;
  tipBox.className = 'tip-box';
  btnApply.hidden = false;

  const isVector = ['.geojson', '.json', '.geojsonl', '.gpkg', '.fgb', '.zip', '.kml'].includes(ext);
  const isPreTiled = ['.mbtiles', '.pmtiles'].includes(ext);

  if (isPreTiled) {
    tipTitle.textContent = `Pre-tiled archive detected (${file.name}):`;
    tipList.innerHTML = `
      <li><strong>Already tiled:</strong> This file is already a packaged MBTiles or PMTiles container.</li>
      <li><strong>Instant preview:</strong> You do not need to convert this file. Use <strong>ðŸ“‚ Quick Open</strong> on the right to load and inspect it immediately on the map!</li>
    `;
    btnApply.hidden = true;
    recommendedSettings = null;
    return;
  }

  if (isVector) {
    tipBox.classList.add('vector');
    tipTitle.textContent = `Vector recommendations for ${file.name} (${bytes(file.size)}):`;
    tipList.innerHTML = `
      <li><strong>Zoom 10–14, Density:</strong> City-scale parcels stay readable without multi-MB low-zoom tiles. Lower zooms drop features to fit 500 KB/tile.</li>
      <li><strong>Auto Engine:</strong> Uses GDAL for Density when Tippecanoe is unavailable. Preserve requires Tippecanoe.</li>
      <li><strong>Attribute filter:</strong> Keep only needed columns (e.g. NIB, KELURAHAN) to shrink tiles 30–50%.</li>
    `;
    recommendedSettings = { minZoom: 10, maxZoom: 14, preset: 'density', engine: 'auto' };
    return;
  }

  // Raster
  if (sizeMB > 400) {
    tipBox.classList.add('large-raster');
    tipTitle.textContent = `Large Orthophoto recommendations for ${file.name} (${bytes(file.size)}):`;
    tipList.innerHTML = `
      <li><strong>Max Zoom 19–20:</strong> Preserves 10–20 cm/px ground detail while avoiding exponential tile explosion at zoom 21–22 (30,000+ tiles, 1 GB+ file).</li>
      <li><strong>WebP Quality 75–80:</strong> Produces 50–70% smaller file size than Quality 100 with visually identical sharpness.</li>
      <li><strong>Avoid Quality 100:</strong> Quality 100 forces lossless WebP mode, creating substantially larger output.</li>
    `;
    recommendedSettings = { minZoom: 0, maxZoom: 19, format: 'webp', quality: 80 };
  } else {
    tipTitle.textContent = `Raster recommendations for ${file.name} (${bytes(file.size)}):`;
    tipList.innerHTML = `
      <li><strong>Max Zoom 18:</strong> Standard balance for aerial and map coverage.</li>
      <li><strong>WebP Quality 80:</strong> Delivers crisp compression with small MBTiles file footprint.</li>
    `;
    recommendedSettings = { minZoom: 0, maxZoom: 18, format: 'webp', quality: 80 };
  }
}

type FileInspection = { kind: 'raster' | 'vector'; crs: string | null; layer?: string; layers?: string[]; fields?: string[]; fieldCollisions?: string[][]; geometryType?: string; bands?: number; width?: number; height?: number; nativeZoom?: number; estimatedTiles?: number; featureCount?: number; elevationCandidate?: boolean; dataType?: string; unit?: string; noData?: number | string; scale?: number; offset?: number; verticalCrs?: string | null; inferredElevationUnit?: 'm' | 'ft'; inferredHeightReference?: 'ellipsoid' | 'orthometric'; minimum?: number; maximum?: number; suggestedNoDataHeight?: number; pixelSize?: number[]; bounds?: number[]; cog?: boolean };
function tilesAtZoom(bounds: number[], zoom: number) {
  const n = 2 ** zoom;
  const x = (lon: number) => ((lon + 180) / 360) * n;
  const y = (lat: number) => { const clamped = Math.min(85.05112878, Math.max(-85.05112878, lat)) * Math.PI / 180; return ((1 - Math.asinh(Math.tan(clamped)) / Math.PI) / 2) * n; };
  return (Math.floor(x(bounds[2]!)) - Math.floor(x(bounds[0]!)) + 1) * (Math.floor(y(bounds[1]!)) - Math.floor(y(bounds[3]!)) + 1);
}
let inspectionId: string | undefined;
interface ByocCredentialInfo { id: string; connectionId: string; endpoint: string; region: string; bucket: string; expiresAt: number; createdAt: number }
let byocCredentials: ByocCredentialInfo[] = [];
let activeByocId: string | null = null;
let activeIamId: string | null = null;
let remoteAccessMode: 'url' | 'byoc' | 'iam' = 'url';
interface RemoteInspectionState {
  inspectionId: string;
  selectedInspection: FileInspection;
  remoteDataset: RemoteDataset;
  recommendedSettings: RecommendedSettings;
  summaryText: string;
}
const remoteInspections: Partial<Record<'url' | 'byoc' | 'iam', RemoteInspectionState>> = {};
let byocStatusTimer: ReturnType<typeof setTimeout> | undefined;
let iamStatusTimer: ReturnType<typeof setTimeout> | undefined;
let iamTrustLoaded = false;
let iamEnabled = false;

async function loadIamTrustInfo() {
  if (iamTrustLoaded) return;
  const iamTab = element<HTMLButtonElement>('remote-iam-tab');
  try {
    const res = await (await api('/api/storage/iam-info')).json() as { enabled: boolean; accountId: string | null; externalId: string | null };
    iamEnabled = Boolean(res.enabled);
    if (!iamEnabled) {
      iamTab.disabled = true;
      iamTab.title = 'IAM Role is not configured on this server';
      const small = iamTab.querySelector('small');
      if (small) small.textContent = 'Not configured';
      if (remoteAccessMode === 'iam') setRemoteAccessMode('url');
      iamTrustLoaded = true;
      return;
    }
    iamTab.disabled = false;
    iamTab.title = 'Shortcut: 3';
    const small = iamTab.querySelector('small');
    if (small) small.textContent = 'Cross-account trust';
    element('iam-tileo-account').textContent = res.accountId || '';
    element('iam-tileo-external-id').textContent = res.externalId || '';
    iamTrustLoaded = true;
  } catch {
    iamEnabled = false;
    iamTab.disabled = true;
    iamTab.title = 'IAM Role is unavailable';
    const small = iamTab.querySelector('small');
    if (small) small.textContent = 'Unavailable';
    if (remoteAccessMode === 'iam') setRemoteAccessMode('url');
  }
}

async function discardInspection(mode = inputSourceMode) {
  if (mode === 's3') {
    for (const key of ['url', 'byoc', 'iam'] as const) {
      const item = remoteInspections[key];
      if (item?.inspectionId) {
        try { await fetch(`/api/storage/inspect/${item.inspectionId}`, { method: 'DELETE' }); } catch { /* ignore */ }
      }
      delete remoteInspections[key];
    }
  }
  if (!inspectionId) return;
  const id = inspectionId; inspectionId = undefined;
  try { await fetch(`${mode === 's3' ? '/api/storage/inspect/' : '/api/inspect/'}${id}`, { method: 'DELETE' }); } catch { /* expiry handles cleanup */ }
}

function setInputSourceMode(mode: 'upload' | 's3') {
  if (inputSourceMode !== mode) void discardInspection(inputSourceMode);
  inputSourceMode = mode;
  selectedInspection = undefined; remoteDataset = undefined; recommendedSettings = null;
  const upload = mode === 'upload';
  element('dataset-picker').hidden = !upload;
  element('file-info').hidden = true;
  element('s3-source-panel').hidden = upload;
  element('source-upload-tab').classList.toggle('active', upload);
  element('source-s3-tab').classList.toggle('active', !upload);
  element('source-upload-tab').setAttribute('aria-selected', String(upload));
  element('source-s3-tab').setAttribute('aria-selected', String(!upload));
  const file = element<HTMLInputElement>('file');
  file.required = upload; file.disabled = productionReadOnly || !upload;
  element('s3-inspection-summary').hidden = true;
  element('tip-box').hidden = true;
  if (!upload) {
    void refreshByocList();
    void loadIamTrustInfo();
    updateInspectReadiness();
  }
  updateDatasetFormState();
}

function byocExpiryLabel(expiresAt: number) {
  const minutes = Math.max(0, Math.round((expiresAt - Date.now()) / 60000));
  if (minutes < 60) return `expires in ${minutes} min`;
  if (minutes < 48 * 60) return `expires in ${Math.round(minutes / 60)} h`;
  return `expires in ${Math.round(minutes / 1440)} d`;
}

function invalidateRemoteInspection(mode: 'url' | 'byoc' | 'iam') {
  const cached = remoteInspections[mode];
  if (cached) {
    void fetch(`/api/storage/inspect/${cached.inspectionId}`, { method: 'DELETE' }).catch(() => {});
    delete remoteInspections[mode];
  }
  if (remoteAccessMode === mode) {
    inspectionId = undefined;
    selectedInspection = undefined;
    remoteDataset = undefined;
    recommendedSettings = null;
    element('s3-inspection-summary').hidden = true;
    updateDatasetFormState();
    updateInspectReadiness();
  }
}

function updateInspectReadiness() {
  const inspectBtn = element<HTMLButtonElement>('inspect-s3');
  const inspectHint = element('s3-inspect-hint');
  let ready = false;
  let hintMsg = '';

  if (remoteAccessMode === 'url') {
    const url = field('s3-url').trim();
    if (!url) {
      hintMsg = 'Paste a presigned or public HTTPS URL above to inspect';
    } else {
      ready = true;
    }
  } else if (remoteAccessMode === 'byoc') {
    const byocList = byocCredentials.filter(c => c.connectionId !== 'iam');
    const hasKey = byocList.some(item => item.id === activeByocId);
    const key = field('s3-key').trim();
    if (!byocList.length) {
      hintMsg = 'Register your bucket keys above to get started';
    } else if (!hasKey) {
      hintMsg = 'Select a registered bucket key above';
    } else if (!key) {
      hintMsg = 'Enter the object key (path inside bucket) above to inspect';
    } else {
      ready = true;
    }
  } else if (remoteAccessMode === 'iam') {
    const iamList = byocCredentials.filter(c => c.connectionId === 'iam');
    const hasRole = iamList.some(item => item.id === activeIamId);
    const key = field('s3-key').trim();
    if (!iamList.length) {
      hintMsg = 'Authorize an IAM Role above to get started';
    } else if (!hasRole) {
      hintMsg = 'Select an authorized IAM Role above';
    } else if (!key) {
      hintMsg = 'Enter the object key (path inside bucket) above to inspect';
    } else {
      ready = true;
    }
  }

  inspectBtn.disabled = !ready;
  if (ready) {
    inspectHint.hidden = true;
  } else {
    inspectHint.hidden = false;
    inspectHint.innerHTML = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7" /> <path d="M12 19V5" /></svg> ${hintMsg}`;
  }
}

async function refreshByocList() {
  const byocListEl = element('byoc-list');
  const byocEmptyEl = element('byoc-empty');
  const iamListEl = element('iam-list');
  const iamEmptyEl = element('iam-empty');
  try {
    const result = await (await api('/api/storage/credentials')).json() as { credentials: ByocCredentialInfo[] };
    byocCredentials = result.credentials;

    const byocList = byocCredentials.filter(c => c.connectionId !== 'iam');
    const iamList = byocCredentials.filter(c => c.connectionId === 'iam');

    if (activeByocId && !byocList.some(item => item.id === activeByocId)) activeByocId = null;
    if (!activeByocId && byocList.length === 1) activeByocId = byocList[0]!.id;

    if (activeIamId && !iamList.some(item => item.id === activeIamId)) activeIamId = null;
    if (!activeIamId && iamList.length === 1) activeIamId = iamList[0]!.id;

    // Render BYOC Keys
    byocListEl.replaceChildren();
    if (byocList.length === 0) element<HTMLDetailsElement>('byoc-register-details').open = true;
    const byocSummary = document.getElementById('byoc-register-summary');
    if (byocSummary) {
      byocSummary.innerHTML = byocList.length === 0
        ? '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 21 9.6-9.6" /> <path d="m7.5 15.5 2.3 2.3a1 1 0 0 1 0 1.4l-2.1 2.1a1 1 0 0 1-1.4 0L4 19" /> <circle cx="15.5" cy="7.5" r="5.5" /></svg> <span>Register bucket credentials</span>'
        : '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /> <path d="M12 5v14" /></svg> <span>Add another bucket key</span>';
    }
    byocEmptyEl.hidden = byocList.length > 0;
    if (!byocList.length) {
      byocListEl.hidden = true;
    } else {
      for (const item of byocList) {
        const row = document.createElement('li'); row.className = `byoc-row${item.id === activeByocId ? ' active' : ''}`;
        const meta = document.createElement('span'); meta.className = 'byoc-meta';
        const host = (() => { try { return new URL(item.endpoint).host; } catch { return item.endpoint || 'S3'; } })();
        meta.textContent = `${item.bucket} · ${host}`;
        const small = document.createElement('small'); small.textContent = byocExpiryLabel(item.expiresAt); meta.append(small);
        const use = document.createElement('button'); use.type = 'button'; use.className = 'secondary job-action byoc-use'; use.textContent = item.id === activeByocId ? 'Selected' : 'Use';
        use.disabled = item.id === activeByocId;
        use.onclick = () => {
          activeByocId = item.id;
          void refreshByocList();
          notice();
          element<HTMLInputElement>('s3-key').focus();
          updateInspectReadiness();
        };
        const revoke = document.createElement('button'); revoke.type = 'button'; revoke.className = 'secondary job-action byoc-revoke'; revoke.textContent = 'Revoke';
        revoke.onclick = async () => {
          try { await api(`/api/storage/credentials/${item.id}`, { method: 'DELETE' }); notice(); }
          catch (error) { notice(error instanceof Error ? error.message : String(error)); }
          invalidateRemoteInspection('byoc');
          await refreshByocList();
        };
        row.append(meta, use, revoke); byocListEl.append(row);
      }
      byocListEl.hidden = false;
    }

    // Render IAM Roles
    iamListEl.replaceChildren();
    if (iamList.length === 0) element<HTMLDetailsElement>('iam-register-details').open = true;
    const iamSummary = document.getElementById('iam-register-summary');
    if (iamSummary) {
      iamSummary.innerHTML = iamList.length === 0
        ? '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg> <span>Authorize IAM Role</span>'
        : '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /> <path d="M12 5v14" /></svg> <span>Authorize another IAM Role</span>';
    }
    iamEmptyEl.hidden = iamList.length > 0;
    if (!iamList.length) {
      iamListEl.hidden = true;
    } else {
      for (const item of iamList) {
        const row = document.createElement('li'); row.className = `byoc-row${item.id === activeIamId ? ' active' : ''}`;
        const meta = document.createElement('span'); meta.className = 'byoc-meta';
        meta.textContent = `${item.bucket} · ${item.region} (IAM)`;
        const small = document.createElement('small'); small.textContent = byocExpiryLabel(item.expiresAt); meta.append(small);
        const use = document.createElement('button'); use.type = 'button'; use.className = 'secondary job-action byoc-use'; use.textContent = item.id === activeIamId ? 'Selected' : 'Use';
        use.disabled = item.id === activeIamId;
        use.onclick = () => {
          activeIamId = item.id;
          void refreshByocList();
          notice();
          element<HTMLInputElement>('s3-key').focus();
          updateInspectReadiness();
        };
        const revoke = document.createElement('button'); revoke.type = 'button'; revoke.className = 'secondary job-action byoc-revoke'; revoke.textContent = 'Revoke';
        revoke.onclick = async () => {
          try { await api(`/api/storage/credentials/${item.id}`, { method: 'DELETE' }); notice(); }
          catch (error) { notice(error instanceof Error ? error.message : String(error)); }
          invalidateRemoteInspection('iam');
          await refreshByocList();
        };
        row.append(meta, use, revoke); iamListEl.append(row);
      }
      iamListEl.hidden = false;
    }

    updateStorageReadModes();
    updateInspectReadiness();
  } catch {
    byocListEl.hidden = true; byocEmptyEl.hidden = false;
    iamListEl.hidden = true; iamEmptyEl.hidden = false;
  }
}

element('source-upload-tab').addEventListener('click', () => setInputSourceMode('upload'));
element('source-s3-tab').addEventListener('click', () => setInputSourceMode('s3'));

function setRemoteAccessMode(mode: 'url' | 'byoc' | 'iam') {
  if (mode === 'iam' && !iamEnabled) return;
  if (remoteAccessMode !== mode && remoteDataset && selectedInspection && inspectionId) {
    const summary = element('s3-inspection-summary');
    remoteInspections[remoteAccessMode] = {
      inspectionId,
      selectedInspection,
      remoteDataset,
      recommendedSettings,
      summaryText: summary.textContent || '',
    };
  }
  remoteAccessMode = mode;
  for (const [id, value] of [['remote-url-tab', 'url'], ['remote-byoc-tab', 'byoc'], ['remote-iam-tab', 'iam']] as const) {
    const button = element(id);
    const active = value === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  element('remote-url-fields').hidden = mode !== 'url';
  element('remote-object-fields').hidden = mode === 'url';
  element('byoc-details').hidden = mode !== 'byoc';
  element('iam-details').hidden = mode !== 'iam';

  // Carry bucket between BYOC and IAM tabs if one is typed
  const byocBucket = element<HTMLInputElement>('byoc-bucket'), iamBucket = element<HTMLInputElement>('iam-bucket');
  if (mode === 'iam' && !iamBucket.value && byocBucket.value) iamBucket.value = byocBucket.value;
  if (mode === 'byoc' && !byocBucket.value && iamBucket.value) byocBucket.value = iamBucket.value;

  const cached = remoteInspections[mode];
  if (cached) {
    inspectionId = cached.inspectionId;
    selectedInspection = cached.selectedInspection;
    remoteDataset = cached.remoteDataset;
    recommendedSettings = cached.recommendedSettings;
    const summary = element('s3-inspection-summary');
    summary.textContent = cached.summaryText;
    summary.hidden = false;
    updateDatasetFormState(remoteDataset, selectedInspection.kind);
    showInspectionRecommendations(remoteDataset, selectedInspection);
    element<HTMLButtonElement>('submit').disabled = false;
  } else {
    inspectionId = undefined;
    selectedInspection = undefined;
    remoteDataset = undefined;
    recommendedSettings = null;
    element('s3-inspection-summary').hidden = true;
    updateDatasetFormState();
    element<HTMLButtonElement>('submit').disabled = true;
  }

  updateStorageReadModes();
  updateInspectReadiness();
}

element('remote-url-tab').addEventListener('click', () => setRemoteAccessMode('url'));
element('remote-byoc-tab').addEventListener('click', () => setRemoteAccessMode('byoc'));
element('remote-iam-tab').addEventListener('click', () => { if (iamEnabled) setRemoteAccessMode('iam'); });

function updateStorageReadModes() {
  let versionPinned = false;
  try { versionPinned = new URL(field('s3-url')).searchParams.has('versionId'); } catch { /* incomplete URL */ }
  const readMode = element<HTMLSelectElement>('s3-read-mode');
  const remote = [...readMode.options].find(option => option.value === 'remote');
  if (remote) {
    if (remoteAccessMode === 'url') {
      remote.disabled = !versionPinned;
    } else if (remoteAccessMode === 'byoc') {
      remote.disabled = true;
    } else if (remoteAccessMode === 'iam') {
      remote.disabled = false;
    }
  }
  if (remote?.disabled && readMode.value === 'remote') readMode.value = 'auto';
}

element('copy-iam-account').addEventListener('click', () => {
  const text = element('iam-tileo-account').textContent || '';
  if (text && text !== 'Loading…' && text !== 'Unavailable') {
    void navigator.clipboard?.writeText(text);
    notice('Copied TileO Account ID to clipboard');
  }
});
element('copy-iam-external-id').addEventListener('click', () => {
  const text = element('iam-tileo-external-id').textContent || '';
  if (text && text !== 'Loading…' && text !== 'Unavailable') {
    void navigator.clipboard?.writeText(text);
    notice('Copied External ID to clipboard');
  }
});

element('s3-key').addEventListener('input', () => {
  if (remoteAccessMode === 'byoc') invalidateRemoteInspection('byoc');
  if (remoteAccessMode === 'iam') invalidateRemoteInspection('iam');
  updateInspectReadiness();
});
element('s3-url').addEventListener('paste', () => { if (remoteAccessMode !== 'url') setRemoteAccessMode('url'); });
element('s3-url').addEventListener('input', () => {
  updateStorageReadModes();
  invalidateRemoteInspection('url');
  updateInspectReadiness();
});

element('byoc-register').addEventListener('click', async () => {
  if (productionReadOnly) { showProductionDialog(); return; }
  const button = element<HTMLButtonElement>('byoc-register');
  const status = element('byoc-status');
  if (byocStatusTimer) clearTimeout(byocStatusTimer);
  const rawEndpoint = element<HTMLInputElement>('byoc-endpoint').value.trim();
  const payload = {
    endpoint: rawEndpoint && !/^[a-z][a-z0-9+.-]*:\/\//i.test(rawEndpoint) ? `https://${rawEndpoint}` : rawEndpoint,
    region: element<HTMLInputElement>('byoc-region').value.trim() || 'auto',
    bucket: element<HTMLInputElement>('byoc-bucket').value.trim(),
    prefix: element<HTMLInputElement>('byoc-prefix').value.trim(),
    accessKeyId: element<HTMLInputElement>('byoc-access-key').value.trim(),
    secretAccessKey: element<HTMLInputElement>('byoc-secret-key').value,
    ttlSeconds: Number(element<HTMLSelectElement>('byoc-ttl').value),
  };
  if (!payload.endpoint || !payload.bucket || !payload.accessKeyId || !payload.secretAccessKey) {
    status.className = 'storage-summary error';
    status.hidden = false; status.textContent = 'Fill the endpoint, bucket, and both key fields first.';
    return;
  }
  button.disabled = true;
  try {
    const result = await (await api('/api/storage/credentials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json() as { credentialId: string; expiresInSeconds: number };
    element<HTMLInputElement>('byoc-endpoint').value = '';
    element<HTMLInputElement>('byoc-bucket').value = '';
    element<HTMLInputElement>('byoc-prefix').value = '';
    element<HTMLInputElement>('byoc-access-key').value = '';
    element<HTMLInputElement>('byoc-secret-key').value = '';
    activeByocId = result.credentialId;
    setRemoteAccessMode('byoc');
    status.className = 'storage-summary';
    status.hidden = false;
    status.textContent = `Keys registered for "${payload.bucket}" (${byocExpiryLabel(Date.now() + result.expiresInSeconds * 1000)}). Selected as active credential. Now enter the object key below.`;
    byocStatusTimer = setTimeout(() => {
      status.hidden = true;
      status.textContent = '';
    }, 10000);
    await refreshByocList();
    element<HTMLInputElement>('s3-key').focus();
    notice();
  } catch (error) {
    status.className = 'storage-summary error';
    status.hidden = false;
    status.textContent = error instanceof Error ? error.message : String(error);
  } finally {
    button.disabled = false;
  }
});

element('byoc-register-summary')?.addEventListener('click', (e) => {
  const details = element<HTMLDetailsElement>('byoc-register-details');
  const hasData = !!(field('byoc-endpoint') || field('byoc-bucket') || field('byoc-access-key') || field('byoc-secret-key'));
  const byocList = byocCredentials.filter(c => c.connectionId !== 'iam');
  if (byocList.length === 0) {
    e.preventDefault();
    if (hasData) element('byoc-register').click();
  } else if (details.open && hasData) {
    e.preventDefault();
    element('byoc-register').click();
  }
});

element('iam-register').addEventListener('click', async () => {
  if (productionReadOnly) { showProductionDialog(); return; }
  const button = element<HTMLButtonElement>('iam-register');
  const status = element('iam-status');
  if (iamStatusTimer) clearTimeout(iamStatusTimer);
  const payload = {
    roleArn: field('iam-role-arn').trim(),
    bucket: field('iam-bucket').trim(),
    region: field('iam-region').trim() || 'us-east-1',
    ttlSeconds: Number(element<HTMLSelectElement>('iam-ttl').value),
  };
  if (!payload.roleArn || !payload.bucket) {
    status.className = 'storage-summary error';
    status.hidden = false; status.textContent = 'Please provide both the Role ARN and Bucket name.';
    return;
  }
  button.disabled = true;
  try {
    const result = await (await api('/api/storage/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })).json() as { credentialId: string; expiresInSeconds: number };
    element<HTMLInputElement>('iam-role-arn').value = '';
    element<HTMLInputElement>('iam-bucket').value = '';
    activeIamId = result.credentialId;
    setRemoteAccessMode('iam');
    status.className = 'storage-summary';
    status.hidden = false;
    status.textContent = `IAM Role authorized for "${payload.bucket}" (${byocExpiryLabel(Date.now() + result.expiresInSeconds * 1000)}). Selected as active role. Now enter the object key below.`;
    iamStatusTimer = setTimeout(() => {
      status.hidden = true;
      status.textContent = '';
    }, 10000);
    await refreshByocList();
    element<HTMLInputElement>('s3-key').focus();
    notice();
  } catch (error) {
    status.className = 'storage-summary error';
    status.hidden = false;
    status.textContent = error instanceof Error ? error.message : String(error);
  } finally {
    button.disabled = false;
  }
});

element('iam-register-summary')?.addEventListener('click', (e) => {
  const details = element<HTMLDetailsElement>('iam-register-details');
  const hasData = !!(field('iam-role-arn') || field('iam-bucket'));
  const iamList = byocCredentials.filter(c => c.connectionId === 'iam');
  if (iamList.length === 0) {
    e.preventDefault();
    if (hasData) element('iam-register').click();
  } else if (details.open && hasData) {
    e.preventDefault();
    element('iam-register').click();
  }
});

element('inspect-s3').addEventListener('click', async () => {
  if (productionReadOnly) { showProductionDialog(); return; }
  const url = remoteAccessMode === 'url' ? field('s3-url').trim() : '';
  const key = field('s3-key').trim();
  const byoc = remoteAccessMode === 'byoc' ? byocCredentials.find(item => item.id === activeByocId && item.connectionId !== 'iam') : undefined;
  const iam = remoteAccessMode === 'iam' ? byocCredentials.find(item => item.id === activeIamId && item.connectionId === 'iam') : undefined;

  if (remoteAccessMode === 'url' && !url) { notice('Paste a presigned or public HTTPS object URL first.'); return; }
  if (remoteAccessMode === 'byoc' && !byoc) { notice('Register your bucket keys above, then select them to continue.'); return; }
  if (remoteAccessMode === 'byoc' && !key) { notice('Enter the object key to inspect with your registered bucket keys.'); return; }
  if (remoteAccessMode === 'iam' && !iam) { notice('Authorize an IAM Role above, then select it to continue.'); return; }
  if (remoteAccessMode === 'iam' && !key) { notice('Enter the object key to inspect with your authorized IAM Role.'); return; }

  await discardInspection('s3');
  const button = element<HTMLButtonElement>('inspect-s3'); button.disabled = true; button.textContent = 'Inspecting remote object…';
  element<HTMLButtonElement>('submit').disabled = true;
  try {
    const readMode = field('s3-read-mode');
    const body = url
      ? { url, readMode }
      : byoc
      ? { credentialId: byoc.id, key, readMode: readMode === 'remote' ? 'auto' : readMode }
      : { credentialId: iam!.id, key, readMode };
    const response = await api('/api/storage/inspect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json() as { inspectionId: string; inspection: FileInspection; source: RemoteDataset['source'] };
    inspectionId = result.inspectionId; selectedInspection = result.inspection;
    const remoteName = url ? new URL(url).pathname.split('/').at(-1) : key.split('/').at(-1);
    remoteDataset = { name: remoteName || 'remote.tif', size: result.source.size, source: result.source };
    element<HTMLSelectElement>('raster-purpose').value = result.inspection.elevationCandidate ? '' : 'imagery';
    element<HTMLSelectElement>('elevation-output').value = 'cog';
    element<HTMLSelectElement>('elevation-unit').value = /^(m|metre|meter|meters|metres)$/i.test(result.inspection.unit ?? '') ? 'm' : /^(ft|foot|feet|international foot|international feet)$/i.test(result.inspection.unit ?? '') ? 'ft' : 'unknown';
    element<HTMLSelectElement>('height-reference').value = 'unknown';
    updateDatasetFormState(remoteDataset, result.inspection.kind);
    showInspectionRecommendations(remoteDataset, result.inspection);
    const summary = element('s3-inspection-summary'); summary.hidden = false;
    const access = result.source.kind === 'url'
      ? result.source.auth === 'presigned' ? 'presigned URL' : 'public URL'
      : byoc
      ? `own bucket keys · ${byoc.bucket}`
      : `IAM role · ${iam?.bucket}`;
    summary.textContent = `${remoteDataset.name} · ${bytes(remoteDataset.size)} · ${access} · ${result.source.cog ? 'validated COG' : 'GeoTIFF'} · ${result.source.readMode === 'remote' ? 'remote range reads' : 'staged to local scratch'}`;
    remoteInspections[remoteAccessMode] = {
      inspectionId,
      selectedInspection,
      remoteDataset,
      recommendedSettings,
      summaryText: summary.textContent,
    };
    element<HTMLButtonElement>('submit').disabled = false; notice();
  } catch (error) { remoteDataset = undefined; selectedInspection = undefined; notice(error instanceof Error ? error.message : String(error)); }
  finally {
    button.disabled = false;
    button.innerHTML = '<svg class="icon icon-fw" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 21-4.34-4.34" /> <circle cx="11" cy="11" r="8" /></svg> Inspect object';
    updateInspectReadiness();
  }
});

const accessTabs = ['url', 'byoc', 'iam'] as const;
element('remote-access-tabs').addEventListener('keydown', (event: KeyboardEvent) => {
  if (['1', '2', '3'].includes(event.key)) {
    event.preventDefault();
    const targetMode = accessTabs[Number(event.key) - 1]!;
    if (targetMode === 'iam' && !iamEnabled) return;
    setRemoteAccessMode(targetMode);
    element(`remote-${targetMode}-tab`).focus();
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    const available = accessTabs.filter(t => t !== 'iam' || iamEnabled);
    const currentIdx = available.indexOf(remoteAccessMode);
    const nextIdx = event.key === 'ArrowRight'
      ? (currentIdx + 1) % available.length
      : (currentIdx + available.length - 1) % available.length;
    setRemoteAccessMode(available[nextIdx]!);
    element(`remote-${available[nextIdx]}-tab`).focus();
  }
});
window.addEventListener('keydown', (event: KeyboardEvent) => {
  if (inputSourceMode !== 's3') return;
  const tag = (document.activeElement?.tagName || '').toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (['1', '2', '3'].includes(event.key)) {
    const targetMode = accessTabs[Number(event.key) - 1]!;
    if (targetMode === 'iam' && !iamEnabled) return;
    event.preventDefault();
    setRemoteAccessMode(targetMode);
    element(`remote-${targetMode}-tab`).focus();
  }
});

function applyRecommendedSettings() {
  if (!recommendedSettings) return;
  if (recommendedSettings.minZoom !== undefined) element<HTMLInputElement>('min-zoom').value = String(recommendedSettings.minZoom);
  if (recommendedSettings.maxZoom !== undefined) element<HTMLInputElement>('max-zoom').value = String(recommendedSettings.maxZoom);
  if (recommendedSettings.format !== undefined) element<HTMLSelectElement>('tile-format').value = recommendedSettings.format;
  if (recommendedSettings.quality !== undefined) element<HTMLInputElement>('quality').value = String(recommendedSettings.quality);
  if (recommendedSettings.preset !== undefined) element<HTMLSelectElement>('vector-preset').value = recommendedSettings.preset;
  if (recommendedSettings.engine !== undefined) element<HTMLSelectElement>('vector-engine').value = recommendedSettings.engine;
  element<HTMLInputElement>('quality').disabled = field('tile-format') === 'png' || (!!selectedInspection?.elevationCandidate && ['elevation', 'scientific'].includes(field('raster-purpose')));
  updateRecommendationNotes();
}

function showInspectionRecommendations(file: DatasetRef, info: FileInspection) {
  const tipBox = element('tip-box'), tipTitle = element('tip-title'), tipList = element('tip-list');
  tipBox.hidden = false;
  tipBox.className = `tip-box${info.kind === 'vector' ? ' vector' : file.size > 400 * 1024 ** 2 ? ' large-raster' : ''}`;
  tipTitle.textContent = `Inspected ${info.kind} dataset: ${file.name}`;
  const featureCount = info.featureCount ?? 0;
  const dense = featureCount > 100_000;
  const maxZoom = info.kind === 'raster' ? info.nativeZoom ?? 18 : featureCount > 500_000 ? 12 : featureCount > 100_000 ? 14 : 16;
  const minZoom = info.kind === 'vector' && dense ? 10 : 0;
  if (info.elevationCandidate) {
    if (info.inferredElevationUnit) element<HTMLSelectElement>('elevation-unit').value = info.inferredElevationUnit;
    if (info.inferredHeightReference) element<HTMLSelectElement>('height-reference').value = info.inferredHeightReference;
    if (info.suggestedNoDataHeight !== undefined) element<HTMLInputElement>('terrain-nodata-height').value = String(info.suggestedNoDataHeight);
  }
  // Extent-aware preserve floor (mirrors the worker guard): avg features per
  // tile at each zoom; first zoom with avg <= 20k is the preserve minimum.
  // Points cluster instead of dropping, so the floor only binds polygons/lines.
  let preserveFloor: number | null = null;
  let avgAtMin: number | null = null;
  if (info.kind === 'vector' && dense && info.bounds?.length === 4) {
    const [w, s, e, n] = info.bounds;
    for (let z = 0; z <= maxZoom; z++) {
      const tiles = tilesAtZoom([w!, s!, e!, n!], z);
      if (tiles > 0 && featureCount / tiles <= 20000) { preserveFloor = z; break; }
    }
    if (preserveFloor === null) preserveFloor = Math.min(maxZoom, 10);
    const tilesAtMin = tilesAtZoom([w!, s!, e!, n!], minZoom);
    if (tilesAtMin > 0) avgAtMin = featureCount / tilesAtMin;
  }
  const geomKind = (info.geometryType ?? '').toLowerCase().includes('point') ? 'point'
    : /(line|curve|string)/.test((info.geometryType ?? '').toLowerCase()) ? 'line'
    : info.geometryType ? 'polygon' : null;
  const lines = info.elevationCandidate && field('raster-purpose') === 'elevation'
    ? [`Single-band ${info.dataType}; ${info.width} × ${info.height} pixels; pixel size ${info.pixelSize?.join(' × ') ?? 'unknown'} in CRS units.`, `CRS: ${info.crs ?? 'missing'}; units: ${info.unit || 'not declared'}${info.inferredElevationUnit ? ` (detected as ${info.inferredElevationUnit})` : ''}; NoData: ${info.noData ?? 'not declared'}.`, `Scale: ${info.scale ?? 1}; offset: ${info.offset ?? 0}; vertical reference: ${info.inferredHeightReference ?? (info.verticalCrs ? 'embedded but ambiguous' : 'not declared')}.`, `Valid height range: ${info.minimum ?? 'unknown'} to ${info.maximum ?? 'unknown'} in source units.${info.suggestedNoDataHeight !== undefined ? ` Suggested terrain NoData fill: ${info.suggestedNoDataHeight} m.` : ''}`, `Recommended: lossless COG. Terrain requires explicit units, height reference and NoData display height; maximum zoom ${maxZoom}.`]
    : info.elevationCandidate && field('raster-purpose') === 'scientific'
    ? [`Single-band ${info.dataType}; ${info.width} × ${info.height} pixels; pixel size ${info.pixelSize?.join(' × ') ?? 'unknown'} in CRS units.`, `CRS: ${info.crs ?? 'missing'}; units: ${info.unit || 'not declared'}; NoData: ${info.noData ?? 'not declared'}.`, `Scale: ${info.scale ?? 1}; offset: ${info.offset ?? 0}.`, 'Output is a lossless COG with a false-color preview range. It is not treated as terrain or elevation.']
    : info.kind === 'raster'
    ? [`Dimensions: ${info.width ?? '?'} × ${info.height ?? '?'} px; ${info.bands ?? '?'} band(s).`, `CRS: ${info.crs ?? 'not present'}${info.nativeZoom !== undefined ? `; estimated native zoom ${info.nativeZoom}` : ''}.`, `Recommended: zoom 0–${maxZoom}, WebP quality 80.${info.estimatedTiles ? ` Approximate coverage: ${info.estimatedTiles.toLocaleString()} tiles at zoom 18.` : ''}`]
    : [`Layer: ${info.layer ?? info.layers?.[0] ?? 'select a layer'}; ${info.featureCount?.toLocaleString() ?? 'unknown'} feature(s)${geomKind ? ` (${geomKind})` : ''}.`, `CRS: ${info.crs ?? 'not present'}${info.layers && info.layers.length > 1 ? `; ${info.layers.length} layers detected` : ''}.`, `Recommended: zoom ${minZoom}–${maxZoom}, ${featureCount > 100_000 ? geomKind === 'point' ? 'clustered density (points merge, never vanish)' : 'adaptive density' : 'preserve features'}, automatic engine.${info.bounds?.length === 4 ? ` Approximate coverage: ${tilesAtZoom(info.bounds, maxZoom).toLocaleString()} tiles at zoom ${maxZoom} — each level above quadruples the count.` : ''}${avgAtMin !== null && avgAtMin > 20000 ? ` ~${Math.round(avgAtMin).toLocaleString()} features per tile at zoom ${minZoom}: low zooms will be heavily thinned.` : ''}`, ...(info.fields?.length ? [`Attributes (${info.fields.length}): ${info.fields.slice(0, 8).join(', ')}${info.fields.length > 8 ? ', …' : ''}. Filter to needed columns to shrink tiles.`] : []), ...(info.fieldCollisions?.length ? [`Case-sensitive columns ${info.fieldCollisions.map(group => group.join(' ↔ ')).join('; ')} are all preserved exactly — tick the intended one.`] : []), ...(preserveFloor !== null ? [`Preserve needs min zoom ≥ ${preserveFloor} at this density (multi-MB tiles below it); Density from ${minZoom} stays compact by thinning low zooms.`] : info.bounds?.length === 4 ? [`Preserve requests all ${featureCount.toLocaleString()} features at every zoom (up to ${(featureCount * (maxZoom + 1)).toLocaleString()} copies) and requires Tippecanoe; shapes smaller than the tile grid may disappear. Density may drop features to keep tiles compact.`] : [])];
  tipList.replaceChildren(...lines.map(line => { const li = document.createElement('li'); li.textContent = line; return li; }));
  if (info.kind === 'vector' && info.layer && !field('layer')) element<HTMLInputElement>('layer').value = info.layer;
  // Dynamic attribute picker: one checkbox per detected column, all kept by
  // default. No typing, no typos (a mistyped name would reject the whole job).
  renderAttributeCheckboxes(info.kind === 'vector' ? info.fields ?? [] : [], info.fieldCollisions ?? []);
  recommendedSettings = info.kind === 'raster'
    ? { minZoom: 0, maxZoom, format: 'webp', quality: 80 }
    : { minZoom, maxZoom, preset: featureCount > 100_000 ? 'density' : 'preserve', engine: 'auto' };
  element<HTMLButtonElement>('btn-apply-rec').hidden = false;
  applyRecommendedSettings();
}

function inspectSelectedFile(file: File) {
  const xhr = new XMLHttpRequest();
  let inspected = false;
  uploading = xhr;
  element<HTMLButtonElement>('submit').disabled = true;
  element('upload-status').hidden = false;
  element('upload-status').querySelector('label')!.firstChild!.textContent = 'Inspecting file ';
  element<HTMLProgressElement>('upload-progress').value = 0;
  element('upload-percent').textContent = '0%';
  xhr.open('POST', `/api/inspect?${new URLSearchParams({ filename: file.name })}`);
  xhr.setRequestHeader('Content-Type', 'application/octet-stream');
  xhr.upload.onprogress = event => { if (event.lengthComputable) { const pct = Math.round(event.loaded / event.total * 100); element<HTMLProgressElement>('upload-progress').value = pct; element('upload-percent').textContent = `${pct}%`; } };
  xhr.onload = () => {
    if (element<HTMLInputElement>('file').files?.[0] !== file) return;
    if (xhr.status >= 400) { try { notice(JSON.parse(xhr.responseText).error.message); } catch { notice(`Inspection failed (${xhr.status}).`); } return; }
    try {
      const result = JSON.parse(xhr.responseText) as { inspectionId: string; inspection: FileInspection };
      inspectionId = result.inspectionId;
      selectedInspection = result.inspection;
      element<HTMLSelectElement>('raster-purpose').value = result.inspection.elevationCandidate ? '' : 'imagery';
      element<HTMLSelectElement>('elevation-output').value = 'cog';
      element<HTMLSelectElement>('elevation-unit').value = /^(m|metre|meter|meters|metres)$/i.test(result.inspection.unit ?? '') ? 'm' : /^(ft|foot|feet|international foot|international feet)$/i.test(result.inspection.unit ?? '') ? 'ft' : 'unknown';
      element<HTMLSelectElement>('height-reference').value = 'unknown';
      element<HTMLInputElement>('terrain-nodata-height').value = '';
      updateDatasetFormState(file, result.inspection.kind);
      showInspectionRecommendations(file, result.inspection);
      inspected = true;
      notice();
    } catch { notice('The server returned invalid inspection metadata.'); }
  };
  xhr.onerror = () => notice('File inspection failed. Check the server and try again.');
  xhr.onabort = () => { if (element<HTMLInputElement>('file').files?.[0] === file) notice('File inspection cancelled. Select the file again to retry.'); };
  xhr.onloadend = () => {
    if (uploading === xhr) uploading = undefined;
    if (element<HTMLInputElement>('file').files?.[0] === file) element<HTMLButtonElement>('submit').disabled = !inspected;
    element('upload-status').hidden = true;
  };
  xhr.send(file);
}

element('file').addEventListener('change', () => {
  selectedInspection = undefined;
  element<HTMLInputElement>('source-crs').value = '';
  element<HTMLInputElement>('layer').value = '';
  renderAttributeCheckboxes([]);
  uploading?.abort();
  if (inspectionId) void fetch(`/api/inspect/${inspectionId}`, { method: 'DELETE' });
  inspectionId = undefined;
  recommendedSettings = null;
  element('tip-box').hidden = true;
  const file = element<HTMLInputElement>('file').files?.[0];
  updateSelectedFile(file);
  updateDatasetFormState(file);
  element<HTMLButtonElement>('submit').disabled = false;
  if (file) {
    if (file.name.toLowerCase().endsWith('.glb')) {
      recommendedSettings = null;
      element('tip-box').hidden = true;
      element<HTMLInputElement>('model-latitude').value = '';
      element<HTMLInputElement>('model-longitude').value = '';
      element<HTMLInputElement>('model-height').value = '';
      element('model-location-note').textContent = 'Reading location metadata…';
      element<HTMLButtonElement>('submit').disabled = true;
      void readModelLocation(file).then(result => {
        if (element<HTMLInputElement>('file').files?.[0] !== file) return;
        if (result.error) { element('model-location-note').textContent = result.error; notice(result.error); return; }
        element<HTMLButtonElement>('submit').disabled = false;
        const location = result.location;
        if (!location) { element('model-location-note').textContent = result.warning ?? 'No readable WGS84 location metadata found.'; return; }
        element<HTMLInputElement>('model-latitude').value = location.latitude.toFixed(7);
        element<HTMLInputElement>('model-longitude').value = location.longitude.toFixed(7);
        if (location.height !== undefined) element<HTMLInputElement>('model-height').value = String(location.height);
        element('model-location-note').textContent = location.height === undefined ? 'WGS84 latitude and longitude loaded. Enter ellipsoid height.' : 'Placement loaded from declared WGS84 metadata. Verify it before creating the job.';
      }).catch(() => {
        if (element<HTMLInputElement>('file').files?.[0] === file) { element('model-location-note').textContent = 'The GLB metadata could not be read.'; notice('The selected GLB is invalid or incomplete.'); }
      });
    }
    else if (['.mbtiles', '.pmtiles'].includes(file.name.slice(file.name.lastIndexOf('.')).toLowerCase())) applyRecommendationsForFile(file);
    else { element('tip-box').hidden = true; inspectSelectedFile(file); }
  }
});

function attributeCheckboxes(): HTMLInputElement[] {
  return [...document.querySelectorAll<HTMLInputElement>('#vector-attributes-list input[type=checkbox]')];
}

function updateAttributeNote() {
  const note = document.getElementById('vector-attributes-note');
  if (!note) return;
  const boxes = attributeCheckboxes();
  if (!boxes.length) {
    note.textContent = 'All attributes are kept by default. Uncheck columns to shrink tiles.';
    return;
  }
  const kept = boxes.filter(b => b.checked).length;
  note.textContent = kept === boxes.length
    ? `All ${boxes.length} attributes kept. Uncheck columns to shrink tiles 30–50%.`
    : kept === 0
      ? 'No attributes selected — output will be pure geometry.'
      : `Keeping ${kept} of ${boxes.length} attributes.`;
}

function renderAttributeCheckboxes(fields: string[], collisions: string[][] = []) {
  const list = document.getElementById('vector-attributes-list');
  if (!list) return;
  list.replaceChildren();
  // Names that differ only by case (ID vs id): flag them so the intended box
  // gets ticked. Values stay exact; both survive into the tiles.
  const colliding = new Set(collisions.flat());
  const partners = new Map<string, string>();
  for (const group of collisions) for (const name of group) partners.set(name, group.filter(other => other !== name).join(', '));
  if (!fields.length) {
    const span = document.createElement('span');
    span.className = 'hint';
    span.textContent = 'Inspect a vector file to choose its columns here — no typing needed.';
    list.append(span);
  } else {
    for (const name of fields) {
      const label = document.createElement('label');
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.value = name;
      box.checked = true;
      const text = document.createElement('span');
      text.textContent = colliding.has(name) ? `${name} ⚠` : name;
      text.title = colliding.has(name) ? `${name} — differs only by case from ${partners.get(name) ?? 'another column'}; both are preserved exactly` : name;
      label.append(box, text);
      list.append(label);
    }
  }
  updateAttributeNote();
}

// null = keep all (no boxes yet, or everything checked — smallest payload);
// otherwise the checked subset ([] = pure geometry).
function selectedVectorAttributes(): string[] | null {
  const boxes = attributeCheckboxes();
  if (!boxes.length) return null;
  const kept = boxes.filter(b => b.checked).map(b => b.value);
  return kept.length === boxes.length ? null : kept;
}

document.getElementById('vector-attributes-list')?.addEventListener('change', updateAttributeNote);
document.getElementById('vector-attrs-all')?.addEventListener('click', () => {
  for (const b of attributeCheckboxes()) b.checked = true;
  updateAttributeNote();
});
document.getElementById('vector-attrs-none')?.addEventListener('click', () => {
  for (const b of attributeCheckboxes()) b.checked = false;
  updateAttributeNote();
});

function resetJobForm() {
  selectedInspection = undefined;
  inspectionId = undefined;
  element<HTMLFormElement>('job-form').reset();
  element<HTMLButtonElement>('submit').disabled = false;
  element('model-location-note').textContent = 'Choose a GLB to read its location metadata.';
  recommendedSettings = null;
  remoteDataset = undefined;
  updateSelectedFile();
  updateDatasetFormState();
  element<HTMLDetailsElement>('source-options-group').open = false;
  element('tip-box').hidden = true;
  setInputSourceMode('upload');
}

element('clear-file').addEventListener('click', () => {
  uploading?.abort();
  if (inspectionId) void fetch(`/api/inspect/${inspectionId}`, { method: 'DELETE' });
  resetJobForm();
});

element('btn-apply-rec').addEventListener('click', () => {
  applyRecommendedSettings();
  notice('Applied recommended settings for this dataset.');
});

function updateRecommendationNotes() {
  const maxZoom = Number(field('max-zoom'));
  const quality = Number(field('quality'));
  const format = field('tile-format');

  const zoomNoteEl = element('zoom-note');
  if (zoomNoteEl) {
    if (selectedInspection?.kind === 'vector') {
      const count = selectedInspection.featureCount ?? 0;
      const minZoom = Number(field('min-zoom'));
      if (count > 100_000) {
        zoomNoteEl.innerHTML = `Dense layer (${count.toLocaleString()} features): <strong>zoom ${Number.isFinite(minZoom) ? minZoom : 10}–${maxZoom}</strong> keeps tiles shippable. Each level up quadruples tiles; low zooms are thinned (density) or rejected (preserve).`;
        zoomNoteEl.style.color = '';
      } else {
        zoomNoteEl.innerHTML = `Recommended: <strong>0–${maxZoom}</strong> for this vector dataset. Dense layers (&gt;100k features) start at <strong>10</strong>.`;
        zoomNoteEl.style.color = '';
      }
    } else if (maxZoom > 20) {
      zoomNoteEl.innerHTML = `⚠️ <strong>High zoom level (${maxZoom}):</strong> Generates 4× more tiles per level. Output size may exceed 500 MB–1 GB. Recommended: <strong>18–20</strong>.`;
      zoomNoteEl.style.color = '#b45309';
    } else {
      zoomNoteEl.innerHTML = 'Recommended: <strong>18–20</strong> for drones and aerials. Zoom 21+ quadruples tiles per level.';
      zoomNoteEl.style.color = '';
    }
  }

  if (recommendedSettings?.maxZoom !== undefined && maxZoom <= 20) element('zoom-note').textContent = `Based on file inspection: zoom 0–${maxZoom}. You can adjust it before creating the job.`;
  const qualityNoteEl = element('quality-note');
  if (qualityNoteEl) {
    if (format === 'png') {
      qualityNoteEl.innerHTML = 'PNG format is lossless by default (quality setting disabled).';
      qualityNoteEl.style.color = '';
    } else if (quality === 100) {
      qualityNoteEl.innerHTML = '⚠️ <strong>Quality 100 activates lossless mode:</strong> Output MBTiles will be 2–3× larger. Recommended: <strong>75–80</strong> for compact size.';
      qualityNoteEl.style.color = '#b45309';
    } else {
      qualityNoteEl.innerHTML = 'Recommended: <strong>75–80</strong>. Quality 100 turns on lossless mode (2–3× larger file).';
      qualityNoteEl.style.color = '';
    }
  }

  // Dynamic vector guard (mirrors the worker): preserve + dense + low minZoom
  // is rejected server-side, so warn before the user submits the job.
  const vectorNoteEl = document.getElementById('vector-note');
  if (vectorNoteEl && selectedInspection?.kind === 'vector') {
    const count = selectedInspection.featureCount ?? 0;
    const preset = (document.getElementById('vector-preset') as HTMLSelectElement | null)?.value ?? 'density';
    const minZoom = Number(field('min-zoom'));
    const geom = (selectedInspection.geometryType ?? '').toLowerCase();
    const isPoint = geom.includes('point');
    if (preset === 'preserve' && count > 100_000 && minZoom < 10) {
      vectorNoteEl.innerHTML = `⚠️ <strong>Preserve with ${count.toLocaleString()} features from zoom ${minZoom} will be rejected:</strong> low-zoom tiles would be multi-MB. Use min zoom ≥ 10, Density, or an attribute filter.`;
      (vectorNoteEl as HTMLElement).style.color = '#b45309';
    } else if (preset === 'density' && count > 100_000 && !isPoint) {
      vectorNoteEl.innerHTML = `Density keeps tiles &lt;500 KB by thinning low zooms${Number.isFinite(minZoom) ? ` from z${minZoom}` : ''} — zoom to z13–14 for full parcel detail. Points would cluster instead of dropping.`;
      (vectorNoteEl as HTMLElement).style.color = '';
    } else if (preset === 'density' && count > 100_000 && isPoint) {
      vectorNoteEl.innerHTML = `Point density clusters nearby dots into countable features — nothing silently vanishes.`;
      (vectorNoteEl as HTMLElement).style.color = '';
    } else {
      vectorNoteEl.innerHTML = 'Density keeps tiles compact and may drop features. Preserve retains more geometry detail and can produce large tiles. Both quantize coordinates.';
      (vectorNoteEl as HTMLElement).style.color = '';
    }
  }
}

element('max-zoom').addEventListener('input', updateRecommendationNotes);
element('min-zoom').addEventListener('input', updateRecommendationNotes);
element('vector-preset').addEventListener('change', updateRecommendationNotes);
element('raster-purpose').addEventListener('change', () => {
  const file: DatasetRef | undefined = inputSourceMode === 's3' ? remoteDataset : element<HTMLInputElement>('file').files?.[0];
  updateDatasetFormState(file, selectedInspection?.kind);
  if (file && selectedInspection) showInspectionRecommendations(file, selectedInspection);
});
element('quality').addEventListener('input', updateRecommendationNotes);
element('tile-format').addEventListener('change', () => {
  element<HTMLInputElement>('quality').disabled = field('tile-format') === 'png';
  updateRecommendationNotes();
});
element('job-form').addEventListener('submit', async event => {
  event.preventDefault(); notice();
  if (productionReadOnly) { showProductionDialog(); return; }
  const localFile = element<HTMLInputElement>('file').files?.[0];
  const file: DatasetRef | undefined = inputSourceMode === 's3' ? remoteDataset : localFile;
  if (!file || uploading) { if (inputSourceMode === 's3') notice('Inspect an S3 object before creating the job.'); return; }
  if (!file.name.toLowerCase().endsWith('.glb') && !['.mbtiles', '.pmtiles'].includes(file.name.slice(file.name.lastIndexOf('.')).toLowerCase()) && !inspectionId) { notice('Inspect the selected dataset before creating its job.'); return; }
  if (selectedInspection?.elevationCandidate && !field('raster-purpose')) { notice('Choose whether this single-band numeric raster is imagery, elevation, or a scientific raster.'); return; }
  if (selectedInspection?.elevationCandidate && field('raster-purpose') === 'elevation' && field('elevation-output') !== 'cog' && !selectedInspection.unit && field('elevation-unit') === 'unknown') { notice('This TIFF does not declare elevation units. Confirm meters or international feet before creating terrain.'); return; }
  if (selectedInspection?.elevationCandidate && field('raster-purpose') === 'elevation' && field('elevation-output') !== 'cog') {
    if (field('elevation-unit') === 'unknown') { notice('Choose meters or international feet before creating terrain.'); return; }
    if (field('height-reference') === 'unknown') { notice('Choose ellipsoid or orthometric height reference before creating terrain.'); return; }
    if (selectedInspection.inferredElevationUnit && field('elevation-unit') !== selectedInspection.inferredElevationUnit) { notice(`The source metadata indicates ${selectedInspection.inferredElevationUnit}; choose the matching elevation unit.`); return; }
    if (selectedInspection.inferredHeightReference && field('height-reference') !== selectedInspection.inferredHeightReference) { notice(`The source vertical CRS indicates ${selectedInspection.inferredHeightReference} heights; choose the matching reference.`); return; }
  }
  const options = file.name.toLowerCase().endsWith('.glb') ? {
    latitude: Number(field('model-latitude')),
    longitude: Number(field('model-longitude')),
    height: Number(field('model-height')),
    heading: Number(field('model-heading')),
    pitch: Number(field('model-pitch')),
    roll: Number(field('model-roll')),
    anchor: field('model-anchor'),
    scale: Number(field('model-scale')),
    exportB3dm: field('model-b3dm') === 'yes',
  } : selectedInspection?.elevationCandidate && field('raster-purpose') === 'elevation' ? {
    exportPmtiles: field('elevation-output') !== 'cog' && field('export-pmtiles') === 'yes', pipeline: 'elevation', elevationOutput: field('elevation-output'), elevationKind: field('elevation-kind'),
    rasterPurpose: 'elevation', elevationUnit: field('elevation-unit'), heightReference: field('height-reference'),
    sourceCrs: field('source-crs').trim() || null,
    ...(field('elevation-output') !== 'cog' ? { minZoom: Number(field('min-zoom')), maxZoom: Number(field('max-zoom')), terrainNoDataHeight: Number(field('terrain-nodata-height')) } : {}),
  } : selectedInspection?.elevationCandidate && field('raster-purpose') === 'scientific' ? {
    pipeline: 'scientific', rasterPurpose: 'scientific', sourceCrs: field('source-crs').trim() || null,
  } : {
    ...(selectedInspection?.elevationCandidate ? { rasterPurpose: 'imagery' } : {}),
    exportPmtiles: field('export-pmtiles') === 'yes',
    minZoom: Number(field('min-zoom')),
    maxZoom: Number(field('max-zoom')),
    tileFormat: field('tile-format'),
    quality: Number(field('quality')),
    vectorPreset: field('vector-preset'),
    vectorEngine: field('vector-engine'),
    sourceCrs: field('source-crs').trim() || null,
    layer: field('layer').trim() || null,
    includeProperties: selectedVectorAttributes(),
  };
  if ('minZoom' in options && typeof options.minZoom === 'number' && typeof options.maxZoom === 'number' && options.minZoom > options.maxZoom) { notice('Minimum zoom cannot exceed maximum zoom.'); return; }
  if ('includeProperties' in options && Array.isArray((options as { includeProperties?: unknown }).includeProperties) && ((options as { includeProperties: string[] }).includeProperties.length === 0) && !window.confirm('No attributes selected. The output will be pure geometry. Continue?')) return;
  if (inputSourceMode === 's3') {
    if (!inspectionId || !remoteDataset) { notice('Inspect the S3 object again before creating the job.'); return; }
    const submit = element<HTMLButtonElement>('submit'); submit.disabled = true;
    element('upload-status').hidden = false;
    element('upload-status').querySelector('label')!.firstChild!.textContent = 'Creating remote job ';
    element<HTMLProgressElement>('upload-progress').removeAttribute('value'); element('upload-percent').textContent = '';
    try {
      await api('/api/jobs/from-source', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inspectionId, options }) });
      resetJobForm(); notice('Remote URL job created. The worker will read the selected dataset from storage.'); await refresh();
    } catch (error) { notice(error instanceof Error ? error.message : String(error)); }
    finally { submit.disabled = false; element('upload-status').hidden = true; element<HTMLProgressElement>('upload-progress').value = 0; }
    return;
  }
  if (!localFile) return;
  const xhr = new XMLHttpRequest(); uploading = xhr;
  element<HTMLButtonElement>('submit').disabled = true; element('upload-status').hidden = false;
  element('upload-status').querySelector('label')!.firstChild!.textContent = inspectionId ? 'Creating job ' : 'Uploading ';
  element<HTMLProgressElement>('upload-progress').value = 0; element('upload-percent').textContent = '0%';
  const query = new URLSearchParams({ filename: localFile.name, options: JSON.stringify(options), ...(inspectionId ? { inspectionId } : {}) });
  xhr.open('POST', `/api/jobs?${query}`);
  xhr.setRequestHeader('Content-Type', 'application/octet-stream');
  xhr.upload.onprogress = event => { if (event.lengthComputable) { const pct = Math.round(event.loaded / event.total * 100); element<HTMLProgressElement>('upload-progress').value = pct; element('upload-percent').textContent = `${pct}%`; } };
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      if (element<HTMLInputElement>('file').files?.[0] === localFile) resetJobForm();
      notice('Job created. Choose another dataset to start a new job.'); void refresh();
    } else { try { notice(JSON.parse(xhr.responseText).error.message); } catch { notice(`Upload failed (${xhr.status}).`); } }
  };
  xhr.onerror = () => notice('The upload connection was interrupted. Check the server and try again.');
  xhr.onabort = () => notice('Upload cancelled.');
  xhr.onloadend = () => { uploading = undefined; element<HTMLButtonElement>('submit').disabled = false; element('upload-status').hidden = true; };
  xhr.send(inspectionId ? null : localFile);
});
element('abort-upload').addEventListener('click', () => uploading?.abort());
for (const id of ['raster-purpose', 'elevation-output']) element(id).addEventListener('change', () => {
  const file: DatasetRef | undefined = inputSourceMode === 's3' ? remoteDataset : element<HTMLInputElement>('file').files?.[0];
  updateDatasetFormState(file, selectedInspection?.kind);
  if (file && selectedInspection) showInspectionRecommendations(file, selectedInspection);
});
element('close-log').addEventListener('click', () => element<HTMLDialogElement>('log-dialog').close());
function textNode(tag: string, text: string, className = '') { const el = document.createElement(tag); el.textContent = text; el.className = className; return el; }
function iconEl(icon: string) { return iconElement(icon, icon === 'spinner' ? 'icon icon-spin' : 'icon'); }
function button(label: string, action: () => Promise<void>, className = 'secondary', icon?: string) {
  const btn = document.createElement('button') as HTMLButtonElement;
  btn.type = 'button';
  btn.className = `secondary job-action ${className}`;
  if (icon) btn.append(iconEl(icon));
  btn.append(document.createTextNode(icon && label ? ` ${label}` : label));
  btn.onclick = async () => { btn.disabled = true; try { await action(); } catch (error) { notice(String(error)); } finally { btn.disabled = false; } };
  return btn;
}
const STATUS_ICON: Record<string, string> = {
  QUEUED: 'clock',
  RUNNING: 'spinner',
  SUCCEEDED: 'circle-check',
  FAILED: 'circle-xmark',
  CANCELLED: 'circle-minus',
};
function statusBadge(status: string) {
  const badge = document.createElement('span');
  badge.className = `badge ${status}`;
  badge.append(iconEl(STATUS_ICON[status] ?? 'circle-info'));
  badge.append(document.createTextNode(` ${status}`));
  return badge;
}
function formatTileBytes(value: number) {
  return value / 1024 >= 1024 ? `${(value / 1024 / 1024).toFixed(1)} MB` : `${Math.round(value / 1024)} KB`;
}
function compareValue(value: unknown) {
  if (value === undefined || value === null || value === '') return '—';
  return Array.isArray(value) ? value.join(', ') : String(value);
}
async function compareJob(job: Job) {
  const data = await (await api(`/api/jobs/${job.id}/compare`)).json();
  element('compare-summary').textContent = `${data.filename} · source metadata and published output metadata`;
  const rows = ['kind', 'crs', 'width', 'height', 'bands', 'dataType', 'bounds', 'noData', 'unit', 'scale', 'offset', 'featureCount', 'format', 'minZoom', 'maxZoom', 'tileCount', 'cogBytes', 'encoding', 'elevationKind', 'elevationUnit', 'heightReference'];
  const table = document.createElement('table'); table.className = 'compare-table';
  table.innerHTML = '<thead><tr><th>Property</th><th>Source</th><th>Result</th></tr></thead>';
  const body = document.createElement('tbody');
  for (const key of rows) {
    const row = document.createElement('tr');
    const property = document.createElement('th'); property.textContent = key;
    const source = document.createElement('td'); source.textContent = compareValue(data.source?.[key]);
    const result = document.createElement('td'); result.textContent = compareValue(data.output?.[key]);
    row.append(property, source, result); body.append(row);
  }
  table.append(body); element('compare-content').replaceChildren(table); element<HTMLDialogElement>('compare-dialog').showModal();
}
element('close-compare').addEventListener('click', () => element<HTMLDialogElement>('compare-dialog').close());
async function benchmarkJob(job: Job) {
  const { benchmarkReport } = await import('../benchmark.js');
  const report = benchmarkReport(job);
  element('benchmark-summary').textContent = report.subtitle;
  const content = element('benchmark-content');
  content.replaceChildren();
  const verdicts = document.createElement('div');
  verdicts.className = 'benchmark-verdicts';
  for (const verdict of report.verdicts) {
    const row = document.createElement('div');
    row.className = `verdict ${verdict.level}`;
    row.append(iconEl(verdict.level === 'ok' ? 'circle-check' : verdict.level === 'warn' ? 'triangle-exclamation' : 'circle-info'));
    row.append(document.createTextNode(` ${verdict.text}`));
    verdicts.append(row);
  }
  content.append(verdicts);
  for (const section of report.sections) {
    const heading = document.createElement('h3');
    heading.textContent = section.title;
    content.append(heading);
    const table = document.createElement('table');
    table.className = 'compare-table';
    table.innerHTML = '<thead><tr><th>Metric</th><th>Source</th><th>Result</th></tr></thead>';
    const body = document.createElement('tbody');
    for (const item of section.rows) {
      const row = document.createElement('tr');
      const metric = document.createElement('th');
      metric.textContent = item.note ? `${item.metric} (${item.note})` : item.metric;
      const source = document.createElement('td'); source.textContent = item.source;
      const result = document.createElement('td'); result.textContent = item.result;
      row.append(metric, source, result); body.append(row);
    }
    table.append(body); content.append(table);
  }
  element<HTMLDialogElement>('benchmark-dialog').showModal();
}
element('close-benchmark').addEventListener('click', () => element<HTMLDialogElement>('benchmark-dialog').close());
let activeCompareClose: (() => void) | null = null;
let compareGeneration = 0;
function stopVisualCompare() {
  compareGeneration++;
  activeCompareClose?.();
  activeCompareClose = null;
}
// Red outline on the source side so the source coverage stays visible even when its pixels resemble the result.
function addSourceOutline(sourceMap: import('maplibre-gl').Map, job: Job) {
  const bounds = job.metadata?.bounds as number[] | undefined;
  if (!bounds || bounds.length !== 4 || !bounds.every(Number.isFinite)) return;
  const [w, s, e, n] = bounds as [number, number, number, number];
  if (w >= e || s >= n) return;
  if (sourceMap.getSource('source-outline')) return;
  sourceMap.addSource('source-outline', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]] } } });
  sourceMap.addLayer({ id: 'source-outline', type: 'line', source: 'source-outline', paint: { 'line-color': '#dc2626', 'line-width': 3, 'line-dasharray': [3, 2] } });
}
async function showVisualCompare(job: Job) {
  stopVisualCompare();
  const generation = compareGeneration;
  const resultMap = map;
  if (!resultMap || !job.metadata) return;
  const gl = await loadMapLibre();
  const style = await buildMapStyle();
  if (map !== resultMap || generation !== compareGeneration) return;
  const container = document.createElement('div'); container.className = 'compare-source-map';
  const divider = document.createElement('div'); divider.className = 'compare-divider'; divider.innerHTML = '<span aria-hidden="true"><svg class="icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 8 4 4-4 4" /> <path d="M2 12h20" /> <path d="m6 8-4 4 4 4" /></svg></span>';
  const sourceLabel = textNode('div', 'Original source · loading…', 'compare-label compare-label-source');
  const outputFormat = String(job.metadata.format ?? job.metadata.kind);
  const resultName = ({ cog: 'COG', 'terrain-rgb': 'Terrain-RGB', terrarium: 'Terrarium', pbf: 'MVT', model3d: '3D Tiles' } as Record<string, string>)[outputFormat] ?? outputFormat.toUpperCase();
  const resultLabel = textNode('div', `Converted result · ${resultName}`, 'compare-label compare-label-result');
  const control = document.createElement('div'); control.className = 'compare-control';
  control.innerHTML = '<div class="compare-actions"><button type="button" data-source><svg class="icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /> <circle cx="9" cy="9" r="2" /> <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg> Source only</button><button type="button" data-split><svg class="icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" /> <path d="M9 3v18" /> <path d="M15 3v18" /></svg> 50 : 50</button><button type="button" data-result><svg class="icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" /> <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" /> <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" /></svg> Result only</button><button type="button" data-details><svg class="icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /> <path d="M12 16v-4" /> <path d="M12 8h.01" /></svg> Details</button><button type="button" data-close><svg class="icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /> <path d="m6 6 12 12" /></svg> Close</button></div>';
  element('map').append(container, divider, sourceLabel, resultLabel, control);
  const sourceMap = new gl.Map({ container, style, center: resultMap.getCenter(), zoom: resultMap.getZoom(), bearing: resultMap.getBearing(), pitch: resultMap.getPitch(), interactive: false, attributionControl: false });
  const mapStage = element('map-stage');
  mapStage.classList.add('is-comparing');
  const lifetime = new AbortController();
  const sync = () => sourceMap.jumpTo({ center: resultMap.getCenter(), zoom: resultMap.getZoom(), bearing: resultMap.getBearing(), pitch: resultMap.getPitch() });
  const resize = new ResizeObserver(() => sourceMap.resize()); resize.observe(element('map'));
  const close = () => {
    if (lifetime.signal.aborted) return;
    lifetime.abort(); resultMap.off('move', sync); resultMap.off('remove', close); resize.disconnect(); sourceMap.remove();
    mapStage.classList.remove('is-comparing');
    for (const item of [container, divider, sourceLabel, resultLabel, control]) item.remove();
    if (activeCompareClose === close) activeCompareClose = null;
  };
  activeCompareClose = close;
  resultMap.on('move', sync); resultMap.once('remove', close);
  const position = (value: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    container.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`; divider.style.left = `${clamped}%`;
    sourceLabel.hidden = clamped < 20; resultLabel.hidden = clamped > 80; divider.hidden = clamped === 0 || clamped === 100;
  };
  position(50);
  for (const [selector, value] of [['source', 100], ['split', 50], ['result', 0]] as const) control.querySelector(`[data-${selector}]`)!.addEventListener('click', () => position(value));
  divider.addEventListener('pointerdown', event => { divider.setPointerCapture(event.pointerId); });
  divider.addEventListener('pointermove', event => { if (divider.hasPointerCapture(event.pointerId)) { const box = element('map').getBoundingClientRect(); position(Math.round(Math.max(0, Math.min(100, (event.clientX - box.left) / box.width * 100)))); } });
  control.querySelector('[data-close]')!.addEventListener('click', close);
  control.querySelector('[data-details]')!.addEventListener('click', () => { void compareJob(job).catch(error => notice(String(error))); });
  sourceMap.on('error', event => { if (!lifetime.signal.aborted) notice(`Source comparison: ${event.error?.message ?? 'Preview unavailable.'}`); });
  sourceMap.once('load', async () => {
    if (lifetime.signal.aborted) return;
    try {
      if (job.metadata!.kind === 'elevation' || job.metadata!.kind === 'scientific') {
        const { showCog } = await import('./cog.js'); await showCog(sourceMap, gl, job, true);
        addSourceOutline(sourceMap, job);
        sourceLabel.textContent = `Original source · ${job.metadata!.kind === 'scientific' ? 'scientific' : 'elevation'} GeoTIFF`;
      } else if (job.metadata!.kind === 'model3d') {
        const { show3dTiles } = await import('./model3d.js');
        if (lifetime.signal.aborted) return;
        const cleanup = show3dTiles(sourceMap, job.id, message => notice(`Source GLB: ${message}`), true);
        lifetime.signal.addEventListener('abort', cleanup, { once: true });
        sourceLabel.textContent = 'Original source · GLB model';
      } else if (job.metadata!.kind === 'vector') {
        sourceMap.addSource('original', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, tolerance: 0, maxzoom: 22 });
        // The source is drawn in magenta/yellow so it stands out against the result (teal/orange).
        sourceMap.addLayer({ id: 'original-fill', type: 'fill', source: 'original', filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': '#c026d3', 'fill-opacity': 0.5 } });
        sourceMap.addLayer({ id: 'original-line', type: 'line', source: 'original', filter: ['!=', ['geometry-type'], 'Point'], paint: { 'line-color': '#a21caf', 'line-width': 3, 'line-dasharray': [2, 1] } });
        sourceMap.addLayer({ id: 'original-point', type: 'circle', source: 'original', filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-color': '#eab308', 'circle-radius': 7, 'circle-stroke-width': 2, 'circle-stroke-color': '#713f12' } });
        addSourceOutline(sourceMap, job);
        let previewRequest: AbortController | undefined;
        const loadViewport = async () => {
          previewRequest?.abort();
          const request = new AbortController(); previewRequest = request;
          const bounds = resultMap.getBounds();
          const west = Math.max(-180, bounds.getWest()), east = Math.min(180, bounds.getEast());
          if (west >= east) { sourceLabel.textContent = 'Original source · move within WGS84 longitude bounds'; return; }
          const bbox = [west, Math.max(-90, bounds.getSouth()), east, Math.min(90, bounds.getNorth())].join(',');
          sourceLabel.textContent = 'Original source · loading visible area…';
          try {
            const response = await api(`/api/jobs/${job.id}/source-preview?${new URLSearchParams({ bbox })}`, { signal: request.signal });
            const data = await response.json();
            if (request.signal.aborted || lifetime.signal.aborted) return;
            (sourceMap.getSource('original') as import('maplibre-gl').GeoJSONSource).setData(data);
            sourceLabel.textContent = `Original source · ${data.features.length.toLocaleString()} features in view${data.preview?.truncated ? ' · partial: zoom in for all features' : ''}`;
          } catch (error) {
            if (!request.signal.aborted && !lifetime.signal.aborted) {
              (sourceMap.getSource('original') as import('maplibre-gl').GeoJSONSource).setData({ type: 'FeatureCollection', features: [] });
              sourceLabel.textContent = 'Original source · preview unavailable: zoom in or move to retry';
              notice(`Source comparison: ${String(error)}`);
            }
          }
        };
        const refresh = () => { void loadViewport(); };
        resultMap.on('moveend', refresh);
        lifetime.signal.addEventListener('abort', () => { previewRequest?.abort(); resultMap.off('moveend', refresh); }, { once: true });
        await loadViewport();
      } else {
        const info = job.metadata!.source as { bounds?: number[] } | undefined;
        const sourceBounds = (info?.bounds ?? job.metadata!.bounds) as [number, number, number, number];
        const pngFallback = async () => {
          const response = await api(`/api/jobs/${job.id}/source-preview`, { signal: lifetime.signal }); const url = URL.createObjectURL(await response.blob());
          if (lifetime.signal.aborted) { URL.revokeObjectURL(url); return; }
          lifetime.signal.addEventListener('abort', () => URL.revokeObjectURL(url), { once: true });
          const [w, s, e, n] = sourceBounds;
          sourceMap.addSource('original', { type: 'image', url, coordinates: [[w,n],[e,n],[e,s],[w,s]] });
          sourceMap.addLayer({ id: 'original-image', type: 'raster', source: 'original', paint: { 'raster-fade-duration': 0 } });
          addSourceOutline(sourceMap, job);
          sourceLabel.textContent = 'Original source · GeoTIFF imagery (1536 px preview)';
        };
        // Stream the original TIFF at full resolution when possible; archived or
        // non-TIFF inputs fall back to the 1536 px preview.
        if (/\.tiff?$/i.test(job.filename ?? '') && !lifetime.signal.aborted) {
          try {
            const georef = await (await api(`/api/jobs/${job.id}/source-georef`, { signal: lifetime.signal })).json();
            if (lifetime.signal.aborted) return;
            const { showOriginalTiff } = await import('./cog.js');
            const cleanupTiff = await showOriginalTiff(sourceMap, gl, { url: `/api/jobs/${job.id}/source`, protocol: `tileo-compare-tiff-${job.id}`, georef, bounds: sourceBounds });
            if (lifetime.signal.aborted) { cleanupTiff(); return; }
            lifetime.signal.addEventListener('abort', cleanupTiff, { once: true });
            addSourceOutline(sourceMap, job);
            sourceLabel.textContent = 'Original source · GeoTIFF imagery (full resolution)';
          } catch { if (!lifetime.signal.aborted) await pngFallback(); }
        } else if (!lifetime.signal.aborted) { await pngFallback(); }
      }
      if (!lifetime.signal.aborted) { control.dataset.ready = 'true'; sync(); }
    } catch (error) {
      if (!lifetime.signal.aborted) { close(); notice(`Source comparison unavailable: ${String(error)}`); }
    }
  });
}
type DownloadOption = { format: string; label: string; extension: string; icon?: string };

function getJobDownloadOptions(job: Job): DownloadOption[] {
  const options: DownloadOption[] = [];
  if (job.metadata?.kind === 'model3d') {
    const formats = Array.isArray(job.metadata.formats) ? job.metadata.formats : [];
    if (formats.includes('b3dm')) {
      options.push({ format: 'b3dm', label: 'B3DM (3D Tiles 1.0)', extension: 'zip', icon: 'box-archive' });
    }
    options.push({ format: 'glb', label: 'Original GLB', extension: 'glb', icon: 'cube' });
    options.push({ format: 'gltf', label: 'glTF 2.0 (ZIP)', extension: 'zip', icon: 'file-zipper' });
  } else if (job.metadata?.kind === 'elevation' && job.options.elevationOutput !== 'cog') {
    options.push({ format: 'cog', label: 'Elevation COG (TIFF)', extension: 'tif', icon: 'mountain' });
    options.push({ format: 'terrain', label: 'Terrain MBTiles', extension: 'mbtiles', icon: 'layer-group' });
    if (job.options.exportPmtiles) {
      options.push({ format: 'pmtiles', label: 'Terrain PMTiles', extension: 'pmtiles', icon: 'box-archive' });
    }
  } else if (job.options.exportPmtiles) {
    options.push({ format: 'pmtiles', label: 'PMTiles archive', extension: 'pmtiles', icon: 'box-archive' });
  }
  return options;
}

function renderJobs(jobs?: Job[]) {
  if (jobs) {
    const serialized = JSON.stringify(jobs);
    if (serialized !== lastJobs) { lastJobs = serialized; allJobs = jobs; }
  }
  const query = element<HTMLInputElement>('job-search').value.trim().toLowerCase();
  const filtered = allJobs.filter(job => !query || [job.filename, job.status, job.stage, job.code, job.error].some(value => value?.toLowerCase().includes(query)));
  const onMapIds = new Set(jobMapLayers.keys());
  if (activeJob && !jobMapLayers.size) onMapIds.add(activeJob.id);
  // Map layers are persistent context, not part of pagination. Keep every
  // mapped result visible while paging/searching through the remaining jobs.
  const pinnedJobs = allJobs.filter(job => onMapIds.has(job.id));
  const browseJobs = filtered.filter(job => !onMapIds.has(job.id));
  const pageCount = Math.max(1, Math.ceil(browseJobs.length / jobsPerPage));
  jobPage = Math.min(jobPage, pageCount);
  const pageJobs = browseJobs.slice((jobPage - 1) * jobsPerPage, jobPage * jobsPerPage);
  const visibleJobs = [...pinnedJobs, ...pageJobs];
  // Skip rebuilding when nothing visible changed: keeps an open ⋯ menu alive
  // across the 2.5 s refresh ticks and avoids DOM churn for static jobs.
  const mapSignature = [...onMapIds].sort().join(',');
  const sig = JSON.stringify([lastJobs, query, jobPage, openMenuJobId, mapSignature]);
  if (sig === lastRenderSig) return;
  lastRenderSig = sig;
  const list = element('jobs'); list.replaceChildren(); element('job-count').textContent = String(allJobs.length);
  element('jobs-result-count').textContent = `${query ? `${filtered.length} matching` : `${allJobs.length} total`}${pinnedJobs.length ? ` · ${pinnedJobs.length} on map` : ''}`;
  element('jobs-page').textContent = `Page ${jobPage} of ${pageCount}`;
  element<HTMLButtonElement>('jobs-prev').disabled = jobPage <= 1;
  element<HTMLButtonElement>('jobs-next').disabled = jobPage >= pageCount;
  if (!visibleJobs.length) list.append(textNode('p', query ? 'No jobs match your search.' : 'Your tile jobs will appear here.', 'empty'));
  if (pinnedJobs.length) {
    const heading = textNode('div', `On map (${pinnedJobs.length})`, 'jobs-section-label pinned');
    heading.prepend(iconEl('thumbtack'));
    list.append(heading);
  }
  let browseHeadingAdded = false;
  for (const job of visibleJobs) {
    const article = document.createElement('article'); article.className = 'job';
    const isOnMap = onMapIds.has(job.id);
    if (isOnMap) {
      article.classList.add('is-active');
      const pinBar = document.createElement('div'); pinBar.className = 'job-pinbar';
      const pin = document.createElement('span'); pin.className = 'job-pin';
      pin.append(iconEl('map-location-dot'), document.createTextNode(' Showing on map'));
      const unpin = document.createElement('button'); unpin.type = 'button';
      unpin.className = 'job-unpin'; unpin.title = 'Remove this job from the map';
      unpin.append(iconEl('xmark'), document.createTextNode(' Remove'));
      unpin.onclick = () => jobMapLayers.has(job.id) ? removeJobMapLayer(job.id) : element<HTMLButtonElement>('btn-clear-preview').click();
      pinBar.append(pin, unpin); article.append(pinBar);
    } else if (pinnedJobs.length && !browseHeadingAdded) {
      const heading = textNode('div', query ? 'Matching jobs' : 'Other jobs', 'jobs-section-label');
      list.append(heading); browseHeadingAdded = true;
    }
    const head = document.createElement('div'); head.className = 'job-head';
    const name = textNode('strong', job.filename);
    name.title = `${job.filename} · created ${new Date(job.created).toLocaleString()}`;
    const corner = document.createElement('span'); corner.className = 'job-corner';
    corner.append(statusBadge(job.status), jobMenu(job));
    head.append(name, corner); article.append(head);
    article.append(textNode('p', `${job.source?.kind === 's3' ? 'S3 · ' : job.source?.kind === 'url' ? 'URL · ' : ''}${bytes(job.size)} · ${job.options.pipeline === 'elevation' ? job.options.elevationOutput !== 'cog' ? `COG + ${job.options.elevationOutput}` : 'Elevation COG' : job.options.pipeline === 'scientific' ? 'Scientific COG' : job.filename.toLowerCase().endsWith('.glb') ? '3D Tiles' : `Zoom ${job.options.minZoom}–${job.options.maxZoom}`} · ${new Date(job.created).toLocaleString()}`, 'hint'));
    if (job.status === 'SUCCEEDED' && job.metadata && typeof job.metadata === 'object') {
      const meta = job.metadata as { tileCount?: unknown; minZoom?: unknown; maxZoom?: unknown; maxTileBytes?: unknown; totalTileBytes?: unknown; cogBytes?: unknown; minKeptPct?: unknown; batch?: { active?: unknown; stream?: unknown; mode?: unknown; normalization?: unknown; featureCount?: unknown; batchCount?: unknown; fallback?: unknown } };
      const parts: string[] = [];
      const outBytes = typeof meta.totalTileBytes === 'number' && meta.totalTileBytes > 0
        ? meta.totalTileBytes + (typeof meta.cogBytes === 'number' && meta.cogBytes > 0 ? meta.cogBytes : 0)
        : typeof meta.cogBytes === 'number' && meta.cogBytes > 0 ? meta.cogBytes : 0;
      if (outBytes > 0) parts.push(`output ${fmtSize(outBytes)}`);
      if (typeof meta.tileCount === 'number') parts.push(`${meta.tileCount.toLocaleString()} tiles`);
      if (typeof meta.minZoom === 'number' && typeof meta.maxZoom === 'number') parts.push(`Zoom ${meta.minZoom}–${meta.maxZoom}`);
      if (typeof meta.maxTileBytes === 'number' && meta.maxTileBytes > 0) parts.push(`largest ${formatTileBytes(meta.maxTileBytes)}/tile`);
      if (typeof meta.minKeptPct === 'number' && meta.minKeptPct < 100) parts.push(`thinned to ${meta.minKeptPct}% at low zooms`);
      if (meta.batch && typeof meta.batch === 'object') {
        const b = meta.batch;
        if (b.active === true) {
          const how = b.stream === true ? 'stream' : 'file';
          const norm = typeof b.normalization === 'string' ? ` ${b.normalization}` : '';
          const feats = typeof b.featureCount === 'number' ? ` · ${b.featureCount.toLocaleString()} features` : '';
          const batches = typeof b.batchCount === 'number' ? ` · ${b.batchCount} batches` : '';
          parts.push(`batch ${how}${norm}${feats}${batches}`);
        } else if (typeof b.fallback === 'string' && b.fallback) parts.push(`fallback ${b.fallback}`);
      }
      if (parts.length) article.append(textNode('p', parts.join(' · '), 'hint result'));
    }
    article.append(textNode('p', job.stage, 'stage'));
    if (job.status === 'RUNNING') { const p = document.createElement('progress'); p.max = 100; p.value = job.progress; p.setAttribute('aria-label', `Completed stages: ${job.progress}%`); article.append(p); const eta = etaText(job); if (eta) article.append(textNode('p', eta, 'hint')); }
    if (job.error) article.append(textNode('p', `${job.code}: ${job.error}`, 'error'));
    const actions = document.createElement('div'); actions.className = 'job-toolbar';
    const main = document.createElement('div'); main.className = 'job-tools';
    if (['QUEUED','RUNNING'].includes(job.status)) main.append(button(job.cancel ? 'Cancelling…' : 'Cancel', async () => { await api(`/api/jobs/${job.id}/cancel`, { method: 'POST' }); await refresh(); }, 'job-cancel', 'ban'));
    if (['FAILED','CANCELLED'].includes(job.status)) main.append(button('Retry', async () => { await api(`/api/jobs/${job.id}/retry`, { method: 'POST' }); await refresh(); }, 'job-retry', 'rotate-right'));
    if (job.status === 'SUCCEEDED') {
      const exclusivePreview = ['elevation', 'scientific', 'model3d'].includes(String(job.metadata?.kind));
      const previewBtn = button(isOnMap ? 'Zoom to' : exclusivePreview ? 'Open preview' : 'Add to map', async () => {
        activeJob = job;
        lastDirectData = null;
        if (isOnMap && jobMapLayers.has(job.id)) zoomToJobMapLayer(job.id);
        else if (isOnMap) zoomToCurrentExtent();
        else await preview(job);
        renderJobs();
      }, `job-preview${isOnMap ? ' active' : ''}`, isOnMap ? 'crosshairs' : 'layer-group');
      previewBtn.title = isOnMap ? 'Center the map on this result' : exclusivePreview ? 'Open this dedicated preview; current job layers will be cleared' : 'Add this result without removing existing job layers';
      main.append(previewBtn);
      // Short visible label keeps one tidy row; the full name stays available
      // to assistive tech (and the existing browser test) via aria-label.
      const fullLabel = ['elevation', 'scientific'].includes(String(job.metadata?.kind)) ? job.metadata?.kind === 'elevation' && job.options.elevationOutput !== 'cog' ? 'Download elevation' : 'Download COG' : job.metadata?.kind === 'model3d' ? 'Download 3D Tiles' : job.options.exportPmtiles ? 'Download tiles' : 'Download MBTiles';
      const alternates = getJobDownloadOptions(job);
      const link = document.createElement('a') as HTMLAnchorElement;
      link.className = 'secondary job-action job-download';
      link.href = `/api/jobs/${job.id}/download`;
      link.addEventListener('click', event => { event.preventDefault(); askDownload(link.href, primaryDownloadName(job)); });
      link.setAttribute('aria-label', fullLabel);
      link.title = fullLabel;
      link.append(iconEl('download'), document.createTextNode(job.metadata?.kind === 'model3d' ? ' 3D ZIP' : ' Download'));

      if (!alternates.length) {
        main.append(link);
      } else {
        const group = document.createElement('div');
        group.className = 'download-split-group';
        link.classList.add('split-main');
        group.append(link);

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'secondary job-action split-toggle';
        toggleBtn.setAttribute('aria-haspopup', 'menu');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.title = 'Other download formats';
        toggleBtn.append(iconEl('chevron-down'));

        const menu = document.createElement('div');
        menu.className = 'download-dropdown-menu';
        menu.setAttribute('role', 'menu');
        menu.hidden = true;

        for (const opt of alternates) {
          const item = document.createElement('a');
          item.className = 'download-dropdown-item';
          item.setAttribute('role', 'menuitem');
          item.href = `/api/jobs/${job.id}/download?file=${opt.format}`;
          item.setAttribute('aria-label', `Download ${opt.label}`);
          item.addEventListener('click', event => {
            event.preventDefault();
            menu.hidden = true;
            toggleBtn.setAttribute('aria-expanded', 'false');
            askDownload(item.href, `${safeDownloadBase(job.filename)}-${opt.format}.${opt.extension}`);
          });
          if (opt.icon) item.append(iconEl(`${opt.icon}`));
          item.append(document.createTextNode(` ${opt.label}`));
          menu.append(item);
        }

        toggleBtn.onclick = e => {
          e.stopPropagation();
          const open = menu.hidden;
          document.querySelectorAll('.download-dropdown-menu').forEach(m => (m as HTMLElement).hidden = true);
          document.querySelectorAll('.split-toggle').forEach(t => t.setAttribute('aria-expanded', 'false'));
          menu.hidden = !open;
          toggleBtn.setAttribute('aria-expanded', String(open));
        };

        group.append(toggleBtn, menu);
        main.append(group);
      }
    }
    actions.append(main);
    article.append(actions); list.append(article);
  }
}
let openMenuJobId: string | null = null;
let lastRenderSig = '';
function menuItem(icon: string, label: string, action: () => Promise<void>, danger = false) {
  const item = document.createElement('button') as HTMLButtonElement;
  item.type = 'button';
  item.setAttribute('role', 'menuitem');
  if (danger) item.className = 'danger';
  item.append(iconEl(icon), document.createTextNode(` ${label}`));
  item.onclick = async () => {
    openMenuJobId = null;
    item.disabled = true;
    try { await action(); } catch (error) { notice(String(error)); }
    renderJobs();
  };
  return item;
}
function landingZoomClamp(value: number) {
  return Math.max(0, Math.min(22, Math.round(value * 100) / 100));
}
function updateLandingSample(next: LandingSample) {
  landingSample = next;
  const centerCell = document.getElementById('landing-center-value');
  if (centerCell) centerCell.textContent = next.center.join(', ');
  const zoomInput = document.getElementById('landing-zoom') as HTMLInputElement | null;
  if (zoomInput && document.activeElement !== zoomInput) zoomInput.value = String(next.zoom);
  element<HTMLTextAreaElement>('landing-snippet').value = landingSampleText(next);
}
function syncLandingSampleFromPreview() {
  const dialog = element<HTMLDialogElement>('landing-dialog');
  if (!dialog.open || !landingSample || !map) return;
  const center = map.getCenter();
  if (!Number.isFinite(center.lng) || !Number.isFinite(center.lat)) return;
  const editingZoom = document.activeElement === document.getElementById('landing-zoom');
  updateLandingSample({
    ...landingSample,
    center: [Number(center.lng.toFixed(5)), Number(center.lat.toFixed(5))],
    zoom: editingZoom ? landingSample.zoom : landingZoomClamp(map.getZoom()),
  });
}
function stopLandingSync() {
  if (landingSyncMap && landingSyncHandler) landingSyncMap.off('move', landingSyncHandler);
  landingSyncMap = null;
  landingSyncHandler = null;
  cancelAnimationFrame(landingSyncFrame);
}
function startLandingSync() {
  stopLandingSync();
  if (!map) return;
  const handler = () => {
    cancelAnimationFrame(landingSyncFrame);
    landingSyncFrame = requestAnimationFrame(syncLandingSampleFromPreview);
  };
  landingSyncMap = map;
  landingSyncHandler = handler;
  map.on('move', handler);
  syncLandingSampleFromPreview();
}
function landingProperty(label: string, value: string, mono = false, id?: string) {
  const row = document.createElement('div');
  row.className = 'landing-row';
  const term = document.createElement('dt');
  term.textContent = label;
  const detail = document.createElement('dd');
  detail.textContent = value;
  if (mono) detail.className = 'mono';
  if (id) detail.id = id;
  row.append(term, detail);
  element('landing-properties').append(row);
  return detail;
}
function renderLandingSample(sample: LandingSample) {
  element('landing-properties').replaceChildren();
  landingProperty('type', sample.kind);
  landingProperty('name', sample.name);
  landingProperty('url', sample.url, true);
  landingProperty('bounds', sample.bounds.join(', '), true);
  landingProperty('center', sample.center.join(', '), true, 'landing-center-value');
  const zoomCell = landingProperty('zoom', '');
  const zoom = document.createElement('input');
  zoom.type = 'number';
  zoom.id = 'landing-zoom';
  zoom.step = '0.01';
  zoom.min = '0';
  zoom.max = '22';
  zoom.value = String(sample.zoom);
  zoom.setAttribute('aria-label', 'Landing sample zoom');
  const hint = document.createElement('span');
  hint.className = 'row-hint';
  hint.textContent = 'live preview';
  zoomCell.append(zoom, hint);
  zoom.addEventListener('input', () => {
    if (!landingSample) return;
    const value = Number(zoom.value);
    if (!Number.isFinite(value)) return;
    updateLandingSample({ ...landingSample, zoom: landingZoomClamp(value) });
  });
  zoom.addEventListener('change', () => {
    if (!landingSample) return;
    zoom.value = String(landingSample.zoom);
    if (map && Math.abs(map.getZoom() - landingSample.zoom) > 0.01) map.easeTo({ zoom: landingSample.zoom, duration: 250 });
  });
  landingProperty('minzoom', String(sample.minzoom));
  landingProperty('maxzoom', String(sample.maxzoom));
  landingProperty('tiles', sample.tiles);
  if (sample.kind === 'vector') {
    landingProperty('source layer', sample.sourceLayer ?? 'features');
    if (sample.geometryType) landingProperty('geometry', sample.geometryType);
    if (sample.fields?.length) landingProperty('attributes', sample.fields.join(', '), true);
  }
  element<HTMLTextAreaElement>('landing-snippet').value = landingSampleText(sample);
}
function updateLandingPreview(job: Job) {
  const bounds = landingSampleBounds(job);
  if (!bounds) return false;
  const container = map?.getContainer() ?? element('map');
  const zoom = fitBoundsZoom(bounds, container.clientWidth || 1200, container.clientHeight || 800, job.options.minZoom, job.options.maxZoom);
  const sample = landingSampleData(job, zoom);
  if (!sample) return false;
  if (map) {
    const center = map.getCenter();
    if (Number.isFinite(center.lng) && Number.isFinite(center.lat)) sample.center = [Number(center.lng.toFixed(5)), Number(center.lat.toFixed(5))];
    const liveZoom = map.getZoom();
    if (Number.isFinite(liveZoom)) sample.zoom = landingZoomClamp(liveZoom);
  }
  landingJob = job;
  landingSample = sample;
  renderLandingSample(sample);
  element('landing-status').textContent = '';
  startLandingSync();
  return true;
}
function openLandingSample(job: Job) {
  if (!updateLandingPreview(job)) { notice('Landing sample properties are unavailable for this job.'); return; }
  const dialog = element<HTMLDialogElement>('landing-dialog');
  if (!dialog.open) {
    element<HTMLDetailsElement>('landing-code').open = false;
    dialog.show();
    queueMicrotask(() => element('copy-landing-sample').focus());
  }
}
function jobMenu(job: Job) {
  const wrap = document.createElement('span');
  wrap.className = 'menu-wrap';
  const open = openMenuJobId === job.id;
  const toggle = document.createElement('button') as HTMLButtonElement;
  toggle.type = 'button';
  toggle.className = 'secondary job-action icon-only job-menu-btn';
  toggle.setAttribute('aria-label', 'More actions');
  toggle.setAttribute('aria-haspopup', 'menu');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.title = 'More actions';
  toggle.append(iconEl('ellipsis-vertical'));
  toggle.onclick = () => { openMenuJobId = open ? null : job.id; renderJobs(); };
  wrap.append(toggle);
  if (open) {
    const menu = document.createElement('div');
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', `Actions for ${job.filename}`);
    menu.className = 'job-menu';
    if (job.status === 'SUCCEEDED') {
      menu.append(menuItem('gauge-high', 'Benchmark', async () => { await benchmarkJob(job); }));
      // ponytail: Compare source hidden until maintained
      /*
      menu.append(menuItem('code-compare', 'Compare source', async () => {
        if (!jobMapLayers.has(job.id) && (activeJob?.id !== job.id || !map)) { activeJob = job; await preview(job); }
        await showVisualCompare(job);
      }));
      */
    }
    menu.append(menuItem('file-lines', 'View log', async () => {
      element('log-text').textContent = await (await api(`/api/jobs/${job.id}/log`)).text(); element<HTMLDialogElement>('log-dialog').showModal();
    }));
    if (['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(job.status)) menu.append(menuItem('trash', 'Delete', async () => {
      if (!window.confirm(`Delete ${job.filename} and its generated files?`)) return;
      await api(`/api/jobs/${job.id}`, { method: 'DELETE' });
      if (jobMapLayers.has(job.id)) removeJobMapLayer(job.id);
      else if (activeJob?.id === job.id) element<HTMLButtonElement>('btn-clear-preview').click();
      await refresh();
    }, true));
    wrap.append(menu);
    menu.querySelector<HTMLElement>('[role=menuitem]')?.focus({ preventScroll: true });
  }
  return wrap;
}
// The ⋯ toggle lives inside .menu-wrap, so this only fires for outside clicks;
// it never swallows the toggle click itself.
document.addEventListener('pointerdown', event => {
  const target = event.target as HTMLElement | null;
  if (openMenuJobId && !target?.closest?.('.menu-wrap')) { openMenuJobId = null; renderJobs(); }
  if (!target?.closest?.('.download-split-group')) {
    document.querySelectorAll('.download-dropdown-menu').forEach(m => (m as HTMLElement).hidden = true);
    document.querySelectorAll('.split-toggle').forEach(t => t.setAttribute('aria-expanded', 'false'));
  }
}, true);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (openMenuJobId) { openMenuJobId = null; renderJobs(); }
    document.querySelectorAll('.download-dropdown-menu').forEach(m => (m as HTMLElement).hidden = true);
    document.querySelectorAll('.split-toggle').forEach(t => t.setAttribute('aria-expanded', 'false'));
    if (activePopup) closeFeaturePopup();
  }
});
element('job-search').addEventListener('input', () => { jobPage = 1; renderJobs(); });
element('jobs-prev').addEventListener('click', () => { if (jobPage > 1) { jobPage--; renderJobs(); } });
element('jobs-next').addEventListener('click', () => { jobPage++; renderJobs(); });
let activeJob: Job | null = null;
type JobMapLayer = {
  job: Job;
  sourceId: string;
  layerIds: string[];
  bounds: [number, number, number, number] | null;
  visible: boolean;
  opacity: number;
  color: string;
  vector: boolean;
};
const jobMapLayers = new Map<string, JobMapLayer>();
let jobMapLayerQueue: Promise<void> = Promise.resolve();
let lastDirectData: { data: any; name: string } | null = null;
let configuredBasemap = {
  url: '',
  apiKey: '',
  attribution: '',
};

function updateBasemapIndicator() {
  const label = document.getElementById('basemap-label');
  if (!label) return;
  const url = configuredBasemap.url?.trim() ?? '';
  const isNone = !url || url.toLowerCase() === 'none' || url.toLowerCase() === 'off';
  const isOsm = !isNone && (url.toLowerCase() === 'osm' || url.includes('/api/basemap/osm') || url.includes('openstreetmap.org'));
  const isPmtiles = !isNone && (url.startsWith('pmtiles://') || url.includes('.pmtiles'));

  label.replaceChildren();
  if (isNone) {
    label.title = 'No basemap configured (neutral canvas)';
    label.append(iconElement('map', 'icon icon-fw'), ' No basemap');
  } else if (isOsm) {
    label.title = 'OpenStreetMap active (ODbL-1.0)';
    label.append(iconElement('map', 'icon icon-fw'), ' OpenStreetMap');
  } else if (isPmtiles) {
    label.title = configuredBasemap.attribution || 'Operator PMTiles archive';
    label.append(iconElement('box-archive', 'icon icon-fw'), ' PMTiles');
  } else {
    label.title = configuredBasemap.attribution || 'Custom basemap';
    label.append(iconElement('map', 'icon icon-fw'), ' Custom basemap');
  }
}

async function buildMapStyle(customSources: Record<string, any> = {}, customLayers: any[] = []): Promise<any> {
  const url = (configuredBasemap.url || '').trim();
  const isNone = !url || url.toLowerCase() === 'none' || url.toLowerCase() === 'off';
  const isOsm = !isNone && (url.toLowerCase() === 'osm' || url.includes('/api/basemap/osm') || url.includes('openstreetmap.org'));
  const isPmtiles = !isNone && (url.startsWith('pmtiles://') || url.includes('.pmtiles'));

  const backgroundLayer = {
    id: 'background',
    type: 'background',
    paint: { 'background-color': '#0b131e' },
  };

  if (isNone) {
    return {
      version: 8,
      sources: { ...customSources },
      layers: [backgroundLayer, ...customLayers],
    };
  }

  let resolvedUrl = url;
  if (isOsm && url.toLowerCase() === 'osm') {
    resolvedUrl = `${location.origin}/api/basemap/osm/{z}/{x}/{y}.png`;
  }
  if (configuredBasemap.apiKey) {
    if (resolvedUrl.includes('{key}')) resolvedUrl = resolvedUrl.replace('{key}', configuredBasemap.apiKey);
    else if (resolvedUrl.includes('{apiKey}')) resolvedUrl = resolvedUrl.replace('{apiKey}', configuredBasemap.apiKey);
    else if (resolvedUrl.includes('{accessToken}')) resolvedUrl = resolvedUrl.replace('{accessToken}', configuredBasemap.apiKey);
    else resolvedUrl += (resolvedUrl.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(configuredBasemap.apiKey);
  }

  if (isPmtiles) {
    await ensurePmtilesProtocol();
    let pmtilesUrl = resolvedUrl;
    if (!pmtilesUrl.startsWith('pmtiles://')) pmtilesUrl = `pmtiles://${pmtilesUrl}`;
    if (!pmtilesUrl.includes('{z}')) pmtilesUrl = pmtilesUrl.replace(/\/+$/, '') + '/{z}/{x}/{y}';
    return {
      version: 8,
      sources: {
        basemap: {
          type: 'raster',
          tiles: [pmtilesUrl],
          tileSize: 256,
          attribution: configuredBasemap.attribution || 'PMTiles Basemap',
        },
        ...customSources,
      },
      layers: [
        backgroundLayer,
        { id: 'basemap', type: 'raster', source: 'basemap' },
        ...customLayers,
      ],
    };
  }

  const sourceId = isOsm ? 'osm' : 'basemap';
  const defaultAttribution = isOsm
    ? '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    : '';

  return {
    version: 8,
    sources: {
      [sourceId]: {
        type: 'raster',
        tiles: [resolvedUrl],
        tileSize: 256,
        attribution: configuredBasemap.attribution || defaultAttribution,
        ...(isOsm ? { maxzoom: 19 } : {}),
      },
      ...customSources,
    },
    layers: [
      backgroundLayer,
      { id: sourceId, type: 'raster', source: sourceId },
      ...customLayers,
    ],
  };
}

let cachedMapLibre: typeof import('maplibre-gl') | undefined;
async function loadMapLibre() {
  if (cachedMapLibre) return cachedMapLibre;
  const moduleUrl = '/maplibre-gl.mjs';
  const maplibregl = await import(moduleUrl) as typeof import('maplibre-gl');
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
  cachedMapLibre = maplibregl;
  return maplibregl;
}

function ensureDropOverlay() {
  const mapEl = element('map');
  let overlay = document.getElementById('map-drop-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'map-drop-overlay';
    overlay.className = 'map-drop-overlay';
    overlay.textContent = 'Drop file to display directly on map';
    mapEl.appendChild(overlay);
  }
  return overlay;
}

function mercatorToLngLat(x: number, y: number): [number, number] {
  const lng = (x / 20037508.34) * 180;
  const lat = (Math.atan(Math.exp((y / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90;
  return [lng, Math.max(-85.0511, Math.min(85.0511, lat))];
}

function normalizeGeoJSONCoordinates(geojson: any): any {
  let isMercator = false;
  function check(coords: any) {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === 'number') {
      if (Math.abs(coords[0]) > 180 && Math.abs(coords[0]) <= 20037508.34) isMercator = true;
    } else {
      for (const item of coords) { check(item); if (isMercator) return; }
    }
  }
  const features = geojson.type === 'FeatureCollection' ? geojson.features : [geojson];
  for (const f of features ?? []) { check(f?.geometry?.coordinates); if (isMercator) break; }
  if (!isMercator) return geojson;

  function transform(coords: any): any {
    if (!Array.isArray(coords)) return coords;
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      return mercatorToLngLat(coords[0], coords[1]);
    }
    return coords.map(transform);
  }
  const cloned = JSON.parse(JSON.stringify(geojson));
  const list = cloned.type === 'FeatureCollection' ? cloned.features : [cloned];
  for (const f of list ?? []) {
    if (f?.geometry?.coordinates) f.geometry.coordinates = transform(f.geometry.coordinates);
  }
  return cloned;
}

let currentActiveBounds: [number, number, number, number] | null = null;
let currentViewport: { minZoom: number; maxZoom: number; preferredZoom?: number } = { minZoom: 0, maxZoom: 18 };

function zoomToCurrentExtent(animate = true) {
  if (!map || !currentActiveBounds) return;
  const [minX, minY, maxX, maxY] = currentActiveBounds;
  const centerLng = (minX + maxX) / 2;
  const centerLat = (minY + maxY) / 2;

  if (Math.abs(maxX - minX) < 0.0001 && Math.abs(maxY - minY) < 0.0001) {
    const model3d = activeJob?.metadata?.kind === 'model3d';
    const zoom = Math.max(currentViewport.minZoom, Math.min(currentViewport.maxZoom, currentViewport.preferredZoom ?? (model3d ? 18 : 14)));
    if (animate) {
      map.flyTo({
        center: [centerLng, centerLat],
        zoom,
        pitch: model3d ? 60 : 0,
        bearing: 0,
        essential: true,
      });
    } else {
      map.jumpTo({ center: [centerLng, centerLat], zoom, pitch: model3d ? 60 : 0, bearing: 0 });
    }
  } else {
    const padding = Math.max(36, Math.min(72, Math.round(Math.min(map.getContainer().clientWidth, map.getContainer().clientHeight) * 0.08)));
    const camera = map.cameraForBounds([[minX, minY], [maxX, maxY]], { padding });
    if (!camera) return;
    const zoom = Math.max(currentViewport.minZoom, Math.min(currentViewport.maxZoom, currentViewport.preferredZoom ?? camera.zoom ?? currentViewport.minZoom));
    map.easeTo({ center: camera.center, zoom, pitch: 0, bearing: 0, duration: animate ? 650 : 0, essential: true });
  }
}

function refreshLandingSampleButton() {
  const job = activeJob && landingSampleBounds(activeJob) ? activeJob : null;
  element('btn-landing-sample').hidden = !job;
  const dialog = element<HTMLDialogElement>('landing-dialog');
  if (!dialog.open) return;
  if (!job) { dialog.close(); return; }
  if (landingJob?.id !== job.id) updateLandingPreview(job);
}
function showLoadedBadge(name: string, info: string, bounds?: [number, number, number, number] | null, viewport?: Partial<typeof currentViewport>, skipZoom = false) {
  if (quickOpenBusy) updateQuickProgress('Preview ready', 100);
  element('no-map-selected').hidden = true;
  element('preview-name').textContent = name;
  element('preview-name').title = name;
  element('preview-state').textContent = 'Dataset loaded';
  element('preview-status').dataset.state = 'loaded';
  const infoEl = element('loaded-data-info');
  const recenterBtn = element('btn-recenter');
  const clearBtn = element('btn-clear-preview');
  infoEl.replaceChildren(...info.split(' · ').filter(Boolean).map(detail => {
    const chip = document.createElement('span');
    chip.className = 'dataset-detail';
    chip.textContent = detail;
    return chip;
  }));
  infoEl.hidden = false;
  currentActiveBounds = bounds ?? null;
  currentViewport = { minZoom: Math.max(0, viewport?.minZoom ?? 0), maxZoom: Math.min(22, Math.max(viewport?.minZoom ?? 0, viewport?.maxZoom ?? 18)), ...(viewport?.preferredZoom !== undefined ? { preferredZoom: viewport.preferredZoom } : {}) };
  recenterBtn.hidden = !currentActiveBounds;
  clearBtn.hidden = false;
  refreshLandingSampleButton();
  if (currentActiveBounds && !skipZoom) {
    zoomToCurrentExtent();
  }
}

function combinedJobLayerBounds(): [number, number, number, number] | null {
  const bounds = [...jobMapLayers.values()].filter(layer => layer.visible && layer.bounds).map(layer => layer.bounds!);
  if (!bounds.length) return null;
  return [
    Math.min(...bounds.map(value => value[0])),
    Math.min(...bounds.map(value => value[1])),
    Math.max(...bounds.map(value => value[2])),
    Math.max(...bounds.map(value => value[3])),
  ];
}

function setJobMapLayerAppearance(layer: JobMapLayer) {
  if (!map) return;
  for (const id of layer.layerIds) {
    try {
      const styleLayer = map.getLayer(id) as { type?: string } | undefined;
      if (!styleLayer) continue;
      map.setLayoutProperty(id, 'visibility', layer.visible ? 'visible' : 'none');
      if (styleLayer.type === 'raster') map.setPaintProperty(id, 'raster-opacity', layer.opacity);
      else if (styleLayer.type === 'fill') map.setPaintProperty(id, 'fill-opacity', 0.45 * layer.opacity);
      else if (styleLayer.type === 'line') map.setPaintProperty(id, 'line-opacity', layer.opacity);
      else if (styleLayer.type === 'circle') map.setPaintProperty(id, 'circle-opacity', layer.opacity);
    } catch { /* layer may be disappearing during a map reset */ }
  }
}

function applyJobMapLayerOrder() {
  if (!map) return;
  for (const layer of jobMapLayers.values()) {
    for (const id of layer.layerIds) {
      try { if (map.getLayer(id)) map.moveLayer(id); } catch { /* style changed */ }
    }
  }
}

function updateJobMapLayerStatus(zoom = false) {
  const layers = [...jobMapLayers.values()];
  const panel = element('map-layers-panel');
  panel.hidden = layers.length === 0;
  element('no-map-selected').hidden = layers.length > 0;
  element('map-layers-count').textContent = `${layers.length} layer${layers.length === 1 ? '' : 's'}`;
  const list = element('map-layers'); list.replaceChildren();
  const topFirst = [...layers].reverse();
  for (const [displayIndex, layer] of topFirst.entries()) {
    const row = document.createElement('div'); row.className = `map-layer-row${layer.visible ? '' : ' is-hidden'}`;
    const visibility = document.createElement('button'); visibility.type = 'button'; visibility.className = 'map-layer-visibility';
    visibility.title = layer.visible ? 'Hide layer' : 'Show layer';
    visibility.setAttribute('aria-label', `${layer.visible ? 'Hide' : 'Show'} ${layer.job.filename}`);
    visibility.append(iconEl(layer.visible ? 'eye' : 'eye-slash'));
    visibility.onclick = () => { layer.visible = !layer.visible; setJobMapLayerAppearance(layer); updateJobMapLayerStatus(); };

    const main = document.createElement('div'); main.className = 'map-layer-main';
    const swatch = document.createElement('span'); swatch.className = 'map-layer-swatch'; swatch.style.background = layer.color;
    const label = document.createElement('span'); label.className = 'map-layer-label';
    const name = textNode('strong', layer.job.filename); name.title = layer.job.filename;
    label.append(name, textNode('small', layer.vector ? 'Vector tiles' : 'Raster tiles'));
    main.append(swatch, label);

    const opacity = document.createElement('input'); opacity.type = 'range'; opacity.className = 'map-layer-opacity';
    opacity.min = '0'; opacity.max = '100'; opacity.value = String(Math.round(layer.opacity * 100));
    opacity.setAttribute('aria-label', `${layer.job.filename} opacity`); opacity.title = `Opacity ${opacity.value}%`;
    opacity.oninput = () => { layer.opacity = Number(opacity.value) / 100; opacity.title = `Opacity ${opacity.value}%`; setJobMapLayerAppearance(layer); };

    const tools = document.createElement('div'); tools.className = 'map-layer-tools';
    const zoomButton = document.createElement('button'); zoomButton.type = 'button'; zoomButton.title = 'Zoom to layer'; zoomButton.setAttribute('aria-label', `Zoom to ${layer.job.filename}`); zoomButton.append(iconEl('crosshairs')); zoomButton.onclick = () => zoomToJobMapLayer(layer.job.id);
    const up = document.createElement('button'); up.type = 'button'; up.className = 'reorder'; up.title = 'Move layer up'; up.setAttribute('aria-label', `Move ${layer.job.filename} up`); up.disabled = displayIndex === 0; up.append(iconEl('chevron-up')); up.onclick = () => moveJobMapLayer(layer.job.id, 1);
    const down = document.createElement('button'); down.type = 'button'; down.className = 'reorder'; down.title = 'Move layer down'; down.setAttribute('aria-label', `Move ${layer.job.filename} down`); down.disabled = displayIndex === topFirst.length - 1; down.append(iconEl('chevron-down')); down.onclick = () => moveJobMapLayer(layer.job.id, -1);
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove'; remove.title = 'Remove layer'; remove.setAttribute('aria-label', `Remove ${layer.job.filename} from map`); remove.append(iconEl('xmark')); remove.onclick = () => removeJobMapLayer(layer.job.id);
    tools.append(zoomButton, up, down, remove); row.append(visibility, main, opacity, tools); list.append(row);
  }

  if (!layers.length) return;
  const visible = layers.filter(layer => layer.visible);
  currentActiveBounds = combinedJobLayerBounds();
  currentViewport = { minZoom: 0, maxZoom: Math.max(...visible.map(layer => layer.job.options.maxZoom), 18) };
  element('preview-state').textContent = 'Job layers loaded';
  element('preview-name').textContent = layers.length === 1 ? layers[0]!.job.filename : `${layers.length} results on map`;
  if (layers.length === 1) element('preview-name').title = layers[0]!.job.filename;
  else element('preview-name').removeAttribute('title');
  element('preview-status').dataset.state = 'loaded';
  const info = element('loaded-data-info');
  info.replaceChildren(
    textNode('span', `${visible.length} visible`, 'dataset-detail'),
    textNode('span', `${layers.filter(layer => layer.vector).length} vector`, 'dataset-detail'),
    textNode('span', `${layers.filter(layer => !layer.vector).length} raster`, 'dataset-detail'),
  );
  info.hidden = false;
  element('btn-recenter').hidden = !currentActiveBounds;
  element('btn-clear-preview').hidden = false;
  refreshLandingSampleButton();
  enableTilePopups(layers.filter(layer => layer.visible && layer.vector).flatMap(layer => layer.layerIds));
  if (zoom && currentActiveBounds) zoomToCurrentExtent();
  renderJobs();
}

function zoomToJobMapLayer(id: string) {
  const layer = jobMapLayers.get(id);
  if (!layer?.bounds) return;
  activeJob = layer.job;
  currentActiveBounds = layer.bounds;
  currentViewport = { minZoom: layer.job.options.minZoom, maxZoom: layer.job.options.maxZoom };
  refreshLandingSampleButton();
  zoomToCurrentExtent();
}

function moveJobMapLayer(id: string, direction: -1 | 1) {
  const layers = [...jobMapLayers.entries()];
  const index = layers.findIndex(([key]) => key === id), target = index + direction;
  if (index < 0 || target < 0 || target >= layers.length) return;
  [layers[index], layers[target]] = [layers[target]!, layers[index]!];
  jobMapLayers.clear(); for (const [key, value] of layers) jobMapLayers.set(key, value);
  applyJobMapLayerOrder(); updateJobMapLayerStatus();
}

function removeJobMapLayer(id: string, update = true) {
  const layer = jobMapLayers.get(id);
  if (!layer) return;
  if (map) {
    for (const layerId of [...layer.layerIds].reverse()) { try { if (map.getLayer(layerId)) map.removeLayer(layerId); } catch { /* map reset */ } }
    try { if (map.getSource(layer.sourceId)) map.removeSource(layer.sourceId); } catch { /* map reset */ }
  }
  jobMapLayers.delete(id);
  if (activeJob?.id === id) activeJob = [...jobMapLayers.values()].at(-1)?.job ?? null;
  if (!update) return;
  if (jobMapLayers.size) updateJobMapLayerStatus();
  else resetPreviewStatus();
  renderJobs();
}

function resetPreviewStatus() {
  currentActiveBounds = null; currentViewport = { minZoom: 0, maxZoom: 18 };
  clickableLayers = []; closeFeaturePopup();
  element('map-layers-panel').hidden = true;
  element('no-map-selected').hidden = false;
  element('preview-name').textContent = 'No dataset selected (Basemap only)';
  element('preview-name').removeAttribute('title');
  element('preview-state').textContent = 'Preview ready';
  element('preview-status').dataset.state = 'empty';
  element('loaded-data-info').hidden = true;
  element('btn-recenter').hidden = true;
  element('btn-clear-preview').hidden = true;
  refreshLandingSampleButton();
}

function clearMapDataLayers() {
  stopVisualCompare();
  stopActive3d();
  jobMapLayers.clear();
  element('map-layers-panel').hidden = true;
  clickableLayers = [];
  closeFeaturePopup();
  if (!map) return;
  try {
    map.setTerrain(null);
    const style = map.getStyle();
    if (style && style.layers) {
      for (const l of style.layers) {
        if (l.id !== 'osm' && l.id !== 'basemap' && l.id !== 'background') {
          if (map.getLayer(l.id)) map.removeLayer(l.id);
        }
      }
    }
    if (style && style.sources) {
      for (const s of Object.keys(style.sources)) {
        if (s !== 'osm' && s !== 'basemap') {
          if (map.getSource(s)) map.removeSource(s);
        }
      }
    }
  } catch (err) {
    console.warn('Error clearing map layers:', err);
  }
}

let activePopup: { remove(): void } | null = null;
let popupWiredMap: unknown = null;
let clickableLayers: string[] = [];

function closeFeaturePopup() {
  try { activePopup?.remove(); } catch { /* popup already gone with its map */ }
  activePopup = null;
}

function showFeaturePopup(lngLat: unknown, html: string) {
  if (!map || !cachedMapLibre) return;
  closeFeaturePopup();
  activePopup = new cachedMapLibre.Popup({ closeButton: true, maxWidth: '300px' })
    .setLngLat(lngLat as [number, number])
    .setHTML(html)
    .addTo(map);
}

function featurePopupHtml(feature: any): string {
  const props = (feature?.properties ?? {}) as Record<string, unknown>;
  const sourceLayer = typeof feature?.sourceLayer === 'string' && feature.sourceLayer
    ? feature.sourceLayer
    : typeof feature?.layer?.['source-layer'] === 'string'
      ? feature.layer['source-layer'] as string
      : undefined;
  const mapped = [...jobMapLayers.values()].find(item => item.sourceId === feature?.source);
  const label = [mapped?.job.filename, sourceLayer].filter(Boolean).join(' · ') || undefined;
  return propertiesHtml(props, label);
}

// Vector tile clicks: one delegated handler per map object. Loaders only
// refresh clickableLayers, so repeated Quick Open loads on the same map never
// stack duplicate handlers (the old GeoJSON popup did).
function enableTilePopups(layerIds: string[]) {
  clickableLayers = layerIds;
  closeFeaturePopup();
  if (!map || !cachedMapLibre || popupWiredMap === map) return;
  popupWiredMap = map;
  const liveMap = map;
  liveMap.on('click', (e: any) => {
    if (!map || map !== popupWiredMap) return;
    let candidates: string[] = [];
    try {
      candidates = clickableLayers.filter(id => {
        try { return !!map!.getLayer(id); } catch { return false; }
      });
    } catch { return; }
    if (!candidates.length) return;
    let features: any[] = [];
    try { features = (liveMap.queryRenderedFeatures(e.point, { layers: candidates }) as any[]) ?? []; } catch { return; }
    const feature = features[0];
    if (!feature) { closeFeaturePopup(); return; }
    showFeaturePopup(e.lngLat, featurePopupHtml(feature));
  });
  liveMap.on('mousemove', (e: any) => {
    if (!map || map !== popupWiredMap || !clickableLayers.length) return;
    let hover = false;
    try {
      const candidates = clickableLayers.filter(id => {
        try { return !!map!.getLayer(id); } catch { return false; }
      });
      hover = candidates.length > 0 && (liveMap.queryRenderedFeatures(e.point, { layers: candidates }) as any[]).length > 0;
    } catch { hover = false; }
    map.getCanvas().style.cursor = hover ? 'pointer' : '';
  });
}

function geojsonBounds(geojson: any): [number, number, number, number] | null {
  if (Array.isArray(geojson.bbox) && geojson.bbox.length === 4) {
    return [geojson.bbox[0], geojson.bbox[1], geojson.bbox[2], geojson.bbox[3]];
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  function coord(c: any) {
    if (Array.isArray(c)) {
      if (typeof c[0] === 'number' && typeof c[1] === 'number') {
        minX = Math.min(minX, c[0]); maxX = Math.max(maxX, c[0]);
        minY = Math.min(minY, c[1]); maxY = Math.max(maxY, c[1]);
      } else {
        for (const item of c) coord(item);
      }
    }
  }
  const features = geojson.type === 'FeatureCollection' ? geojson.features :
                   geojson.type === 'Feature' ? [geojson] :
                   geojson.type === 'GeometryCollection' ? geojson.geometries.map((g: any) => ({ geometry: g })) :
                   [{ geometry: geojson }];
  for (const f of features ?? []) {
    if (f?.geometry?.coordinates) coord(f.geometry.coordinates);
    else if (f?.geometry?.geometries) {
      for (const g of f.geometry.geometries) if (g?.coordinates) coord(g.coordinates);
    }
    if (Array.isArray(f?.bbox) && f.bbox.length === 4) {
      minX = Math.min(minX, f.bbox[0]); maxX = Math.max(maxX, f.bbox[2]);
      minY = Math.min(minY, f.bbox[1]); maxY = Math.max(maxY, f.bbox[3]);
    }
  }
  return (Number.isFinite(minX) && Number.isFinite(minY) && Number.isFinite(maxX) && Number.isFinite(maxY))
    ? [minX, minY, maxX, maxY]
    : null;
}

function kmlToGeoJSON(kmlText: string): any {
  const parser = new DOMParser();
  const xml = parser.parseFromString(kmlText, 'text/xml');
  const features: any[] = [];
  for (const placemark of Array.from(xml.querySelectorAll('Placemark'))) {
    const name = placemark.querySelector('name')?.textContent || '';
    const point = placemark.querySelector('Point coordinates');
    const line = placemark.querySelector('LineString coordinates');
    const poly = placemark.querySelector('Polygon coordinates');
    if (point?.textContent) {
      const parts = point.textContent.trim().split(',').map(Number);
      if (!isNaN(parts[0]!) && !isNaN(parts[1]!)) {
        features.push({ type: 'Feature', properties: { name }, geometry: { type: 'Point', coordinates: [parts[0], parts[1]] } });
      }
    } else if (line?.textContent) {
      const coords = line.textContent.trim().split(/\s+/).map(p => p.split(',').slice(0, 2).map(Number)).filter(c => !isNaN(c[0]!) && !isNaN(c[1]!));
      if (coords.length) features.push({ type: 'Feature', properties: { name }, geometry: { type: 'LineString', coordinates: coords } });
    } else if (poly?.textContent) {
      const coords = poly.textContent.trim().split(/\s+/).map(p => p.split(',').slice(0, 2).map(Number)).filter(c => !isNaN(c[0]!) && !isNaN(c[1]!));
      if (coords.length) features.push({ type: 'Feature', properties: { name }, geometry: { type: 'Polygon', coordinates: [coords] } });
    }
  }
  return { type: 'FeatureCollection', features };
}

async function loadDirectGeoJSON(rawGeojson: any, name: string) {
  lastDirectData = { data: rawGeojson, name };
  activeJob = null;
  if (!map) throw new Error('Map is not ready.');
  if (!map.isStyleLoaded()) {
    const pendingMap = map;
    await new Promise<void>((resolve, reject) => {
      const ready = () => { pendingMap.off('remove', removed); resolve(); };
      const removed = () => { pendingMap.off('load', ready); reject(new Error('Map was closed while loading the dataset.')); };
      pendingMap.once('load', ready);
      pendingMap.once('remove', removed);
    });
  }

  const data = normalizeGeoJSONCoordinates(rawGeojson);
  clearMapDataLayers();

  map.addSource('direct-data', { type: 'geojson', data });

  map.addLayer({
    id: 'direct-fill',
    type: 'fill',
    source: 'direct-data',
    filter: ['==', ['geometry-type'], 'Polygon'],
    paint: { 'fill-color': '#008a78', 'fill-opacity': 0.45 },
  });
  map.addLayer({
    id: 'direct-line',
    type: 'line',
    source: 'direct-data',
    paint: { 'line-color': '#006c83', 'line-width': 2.5 },
  });
  map.addLayer({
    id: 'direct-point',
    type: 'circle',
    source: 'direct-data',
    filter: ['==', ['geometry-type'], 'Point'],
    paint: { 'circle-color': '#e05a47', 'circle-radius': 6, 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' },
  });

  enableTilePopups(['direct-fill', 'direct-line', 'direct-point']);

  const count = data.type === 'FeatureCollection' ? (data.features?.length ?? 1) : 1;
  const bbox = geojsonBounds(data);
  showLoadedBadge(name, `Direct ${/\.kml$/i.test(name) ? 'KML' : 'GeoJSON'} · ${count.toLocaleString()} feature${count > 1 ? 's' : ''}`, bbox, { minZoom: 0, maxZoom: 19, ...(bbox && Math.abs(bbox[2] - bbox[0]) < 0.0001 && Math.abs(bbox[3] - bbox[1]) < 0.0001 ? { preferredZoom: 15 } : {}) });
  notice(`Loaded "${name}" (${count.toLocaleString()} feature${count > 1 ? 's' : ''}) directly on map.`);
}

let pmtilesProtocolRegistered = false;
async function ensurePmtilesProtocol(maplibreglInstance?: any) {
  if (pmtilesProtocolRegistered) return (window as any)._pmtilesProtocol;
  const m = maplibreglInstance || await loadMapLibre();
  try {
    const { Protocol } = await import('/pmtiles.mjs' as any) as any;
    const protocol = new Protocol();
    m.addProtocol('pmtiles', protocol.tile);
    pmtilesProtocolRegistered = true;
    (window as any)._pmtilesProtocol = protocol;
    return protocol;
  } catch (err) {
    console.warn('Could not register PMTiles protocol:', err);
    return null;
  }
}
async function loadDirectPMTiles(file: File) {
  notice(`Loading PMTiles "${file.name}"...`);
  updateQuickProgress('Reading PMTiles metadata…', 0);
  const maplibregl = await loadMapLibre();
  await ensurePmtilesProtocol(maplibregl);
  const pmtilesModuleUrl = '/pmtiles.mjs';
  const { FileSource, PMTiles } = await import(pmtilesModuleUrl) as any;

  const source = new FileSource(file);
  const p = new PMTiles(source);
  const header = await p.getHeader();
  if (![header.minZoom, header.maxZoom, header.minLon, header.minLat, header.maxLon, header.maxLat].every(Number.isFinite) || header.minZoom < 0 || header.maxZoom > 22 || header.minZoom > header.maxZoom || header.minLon >= header.maxLon || header.minLat >= header.maxLat) throw new Error('PMTiles metadata contains an invalid zoom range or bounds.');
  updateQuickProgress('Preparing map preview…', 85);
  (window as any)._pmtilesProtocol.add(p);

  clearMapDataLayers();

  const isVector = header.tileType === 2;
  const pmtilesUrl = `pmtiles://${encodeURIComponent(file.name)}/{z}/{x}/{y}`;

  map?.addSource('direct-pmtiles', {
    type: isVector ? 'vector' : 'raster',
    tiles: [pmtilesUrl],
    minzoom: header.minZoom,
    maxzoom: header.maxZoom,
    ...(isVector ? {} : { tileSize: 256 }),
    bounds: [header.minLon, header.minLat, header.maxLon, header.maxLat],
  });

  if (!isVector) {
    map?.addLayer({ id: 'pmtiles-raster', type: 'raster', source: 'direct-pmtiles', paint: { 'raster-resampling': 'linear', 'raster-fade-duration': 120 } });
  } else {
    const meta = await p.getMetadata().catch(() => ({}));
    const vectorLayers = (meta as any).vector_layers || [{ id: 'features' }];
    const clickable: string[] = [];
    for (const l of vectorLayers) {
      const lid = l.id || 'features';
      map?.addLayer({
        id: `pmtiles-${lid}-fill`,
        type: 'fill',
        source: 'direct-pmtiles',
        'source-layer': lid,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': '#008a78', 'fill-opacity': 0.45 },
      });
      map?.addLayer({
        id: `pmtiles-${lid}-line`,
        type: 'line',
        source: 'direct-pmtiles',
        'source-layer': lid,
        paint: { 'line-color': '#007164', 'line-width': 2 },
      });
      map?.addLayer({
        id: `pmtiles-${lid}-point`,
        type: 'circle',
        source: 'direct-pmtiles',
        'source-layer': lid,
        filter: ['==', ['geometry-type'], 'Point'],
        paint: { 'circle-color': '#d6703d', 'circle-radius': 5, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#fff' },
      });
      clickable.push(`pmtiles-${lid}-fill`, `pmtiles-${lid}-line`, `pmtiles-${lid}-point`);
    }
    enableTilePopups(clickable);
  }

  activeJob = null;
  lastDirectData = null;
  const bounds: [number, number, number, number] = [header.minLon, header.minLat, header.maxLon, header.maxLat];
  showLoadedBadge(file.name, `Direct PMTiles · ${isVector ? 'Vector MVT' : 'Raster'} · Zoom ${header.minZoom}–${header.maxZoom}`, bounds, { minZoom: header.minZoom, maxZoom: header.maxZoom });
  notice(`Loaded PMTiles "${file.name}" on map.`);
}

let activeTiffCleanup: (() => void) | null = null;
let active3dCleanup: (() => void) | null = null;
function stopActive3d() { active3dCleanup?.(); active3dCleanup = null; }
let activeQuickId: string | null = null;
function releaseQuickFile() {
  if (activeQuickId) void fetch(`/api/quick/${activeQuickId}`, { method: 'DELETE' });
  activeQuickId = null;
}
function stopActiveTiff() { activeTiffCleanup?.(); activeTiffCleanup = null; releaseQuickFile(); }
async function loadDirectTiff(file: File) {
  notice(`Loading GeoTIFF "${file.name}"...`);
  const res = await uploadQuickFile(`/api/quick/tiff?filename=${encodeURIComponent(file.name)}&mode=${encodeURIComponent(field('quick-tiff-mode'))}`, file);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to inspect TIFF.');
  }
  const meta = await res.json();
  activeQuickId = meta.id;
  updateQuickProgress('Preparing map preview…', 85);
  clearMapDataLayers();
  const maplibregl = await loadMapLibre();
  const { showOriginalTiff } = await import('./cog.js');
  if (!map) throw new Error('Map is not ready.');
  // Stream the original file on demand; no conversion or downsampling takes place.
  activeTiffCleanup = await showOriginalTiff(map, maplibregl, {
    url: `${location.origin}/api/quick/${meta.id}/file`,
    protocol: `tileo-quick-tiff-${meta.id}`,
    georef: meta,
    bounds: meta.bounds,
  });
  activeJob = null;
  lastDirectData = null;
  const depth = meta.bands[0]?.colorInterpretation === 'Palette' ? 'palette' : meta.bands.length <= 2 ? 'grayscale' : meta.bands.length === 3 ? 'RGB' : 'RGBA';
  const info = ['elevation', 'scientific'].includes(meta.display?.mode)
    ? `${meta.display.kind.toUpperCase()} ${meta.display.mode === 'elevation' ? 'elevation' : 'numeric raster'} · ${meta.bands[0]?.type} · ${meta.display.minimum.toLocaleString()}–${meta.display.maximum.toLocaleString()} ${meta.display.unit || '(unit unspecified)'}`
    : `${depth} · ${meta.bands[0]?.type === 'UInt16' ? '16-bit' : '8-bit'}`;
  showLoadedBadge(file.name, `Direct GeoTIFF · ${meta.width.toLocaleString()} × ${meta.height.toLocaleString()} px · ${info} · Native Z${meta.nativeZoom ?? '—'}`, meta.bounds, { minZoom: 0, maxZoom: meta.nativeZoom ?? 18 });
  notice(`Loaded GeoTIFF "${file.name}" on map. The original file is streamed on demand with HTTP Range.`);
}

async function loadDirectMBTiles(file: File) {
  notice(`Inspecting MBTiles "${file.name}"...`);
  const res = await uploadQuickFile(`/api/quick/mbtiles?filename=${encodeURIComponent(file.name)}`, file);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to inspect MBTiles.');
  }
  const meta = await res.json();
  updateQuickProgress('Preparing map preview…', 85);
  clearMapDataLayers();

  const isVector = meta.kind === 'vector';
  const sourceUrl = `${location.origin}/api/quick/${meta.id}/tiles/{z}/{x}/{y}`;
  map?.addSource('direct-mbtiles', {
    type: isVector ? 'vector' : 'raster',
    tiles: [sourceUrl],
    minzoom: meta.minZoom,
    maxzoom: meta.maxZoom,
    ...(isVector ? {} : { tileSize: 256 }),
    ...(meta.bounds ? { bounds: meta.bounds } : {}),
  });

  if (!isVector) {
    map?.addLayer({ id: 'mbtiles-raster', type: 'raster', source: 'direct-mbtiles', paint: { 'raster-resampling': 'linear', 'raster-fade-duration': 120 } });
  } else {
    const clickable: string[] = [];
    for (const l of meta.vectorLayers || [{ id: 'features' }]) {
      const lid = l.id || 'features';
      map?.addLayer({
        id: `mbtiles-${lid}-fill`,
        type: 'fill',
        source: 'direct-mbtiles',
        'source-layer': lid,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': '#008a78', 'fill-opacity': 0.45 },
      });
      map?.addLayer({
        id: `mbtiles-${lid}-line`,
        type: 'line',
        source: 'direct-mbtiles',
        'source-layer': lid,
        paint: { 'line-color': '#007164', 'line-width': 2 },
      });
      map?.addLayer({
        id: `mbtiles-${lid}-point`,
        type: 'circle',
        source: 'direct-mbtiles',
        'source-layer': lid,
        filter: ['==', ['geometry-type'], 'Point'],
        paint: { 'circle-color': '#d6703d', 'circle-radius': 5, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#fff' },
      });
      clickable.push(`mbtiles-${lid}-fill`, `mbtiles-${lid}-line`, `mbtiles-${lid}-point`);
    }
    enableTilePopups(clickable);
  }

  activeJob = null;
  lastDirectData = null;
  const tileTag = meta.tileCount ? `${meta.tileCount.toLocaleString()} tiles` : '';
  const badgeInfo = ['Direct MBTiles', isVector ? 'Vector MVT' : `Raster (${meta.format.toUpperCase()})`, tileTag, `Zoom ${meta.minZoom}–${meta.maxZoom}`].filter(Boolean).join(' · ');
  showLoadedBadge(file.name, badgeInfo, meta.bounds, { minZoom: meta.minZoom, maxZoom: meta.maxZoom });
  notice(`Loaded MBTiles "${file.name}" (${meta.tileCount} tiles) on map.`);
}

// Overall progress uses completed stages: file transfer 0–70%, inspection 70%,
// preview preparation 85%, and ready 100%. Server work has no byte counter.
function updateQuickProgress(stage: string, percent?: number) {
  element('quick-progress-stage').textContent = stage;
  const progress = element<HTMLProgressElement>('quick-progress');
  const value = Math.max(progress.value, Math.min(100, percent ?? progress.value));
  progress.value = value;
  progress.setAttribute('aria-valuetext', `${Math.round(value)}% · ${stage}`);
  element('quick-progress-value').textContent = `${Math.round(value)}%`;
  element('quick-open-text').textContent = `Loading ${Math.round(value)}%`;
}

async function paintQuickProgress(stage: string, percent: number) {
  updateQuickProgress(stage, percent);
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function readQuickFile(file: File): Promise<string> {
  updateQuickProgress('Reading file…', 0);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = event => {
      if (event.lengthComputable) updateQuickProgress('Reading file…', event.loaded / event.total * 70);
    };
    reader.onload = () => {
      updateQuickProgress('Inspecting dataset…', 70);
      resolve(String(reader.result));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the selected file.'));
    reader.onabort = () => reject(new Error('File reading cancelled.'));
    reader.readAsText(file);
  });
}

// XHR exposes bytes uploaded, so the percentage reflects actual transfer progress.
function uploadQuickFile(url: string, file: File): Promise<Response> {
  updateQuickProgress('Uploading file…', 0);
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', url);
    request.setRequestHeader('Content-Type', 'application/octet-stream');
    request.upload.onprogress = event => {
      updateQuickProgress('Uploading file…', event.lengthComputable ? event.loaded / event.total * 70 : undefined);
    };
    request.upload.onload = () => updateQuickProgress('Upload complete · Inspecting dataset…', 70);
    request.onload = () => resolve(new Response(request.responseText, { status: request.status, headers: { 'Content-Type': 'application/json' } }));
    request.onerror = () => reject(new Error('Upload failed. Check your connection and try again.'));
    request.onabort = () => reject(new Error('Upload cancelled.'));
    request.send(file);
  });
}

let quickOpenBusy = false;
async function handleDirectFile(file: File) {
  if (quickOpenBusy) return;
  quickOpenBusy = true;
  const button = element('quick-open');
  const icon = button.querySelector('svg')!;
  button.setAttribute('aria-busy', 'true');
  element('quick-open-text').textContent = 'Loading…';
  element('quick-progress-panel').hidden = false;
  element('quick-progress-file').textContent = file.name;
  element<HTMLProgressElement>('quick-progress').value = 0;
  updateQuickProgress('Reading file…', 0);
  icon.setAttribute('class', 'icon icon-spin');
  element<HTMLInputElement>('quick-file').disabled = true;
  element<HTMLSelectElement>('quick-tiff-mode').disabled = true;
  element<HTMLButtonElement>('btn-clear-preview').disabled = true;
  try {
    await openDirectFile(file);
  } finally {
    if (element<HTMLProgressElement>('quick-progress').value === 100) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    element('quick-progress-panel').hidden = true;
    quickOpenBusy = false;
    button.setAttribute('aria-busy', 'false');
    element('quick-open-text').textContent = 'Quick Open';
    icon.replaceWith(iconElement('folder-open'));
    element<HTMLInputElement>('quick-file').disabled = false;
    element<HTMLSelectElement>('quick-tiff-mode').disabled = false;
    element<HTMLButtonElement>('btn-clear-preview').disabled = false;
  }
}

async function openDirectFile(file: File) {
  notice();
  stopVisualCompare();
  stopActive3d();
  // Quick Open is a 2D inspection workflow. A previous 3D preview leaves the
  // shared MapLibre camera pitched even after its deck.gl layer is removed.
  if (map) map.jumpTo({ pitch: 0, bearing: 0 });
  // A previous streamed TIFF holds a tile protocol; release it before loading anything else.
  stopActiveTiff();
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

  if (['.geojson', '.json'].includes(ext)) {
    try {
      const text = await readQuickFile(file);
      await paintQuickProgress('Parsing dataset…', 75);
      const data = JSON.parse(text);
      if (data.type !== 'FeatureCollection' && data.type !== 'Feature' && !data.coordinates && !data.geometries) {
        throw new Error('File does not appear to be valid GeoJSON.');
      }
      await paintQuickProgress('Preparing map preview…', 85);
      await loadDirectGeoJSON(data, file.name);
      return;
    } catch (err: any) {
      notice(`Failed to load GeoJSON: ${err?.message || err}`);
      return;
    }
  }

  if (ext === '.kml') {
    try {
      const text = await readQuickFile(file);
      await paintQuickProgress('Parsing dataset…', 75);
      const data = kmlToGeoJSON(text);
      if (!data.features.length) throw new Error('No features found in KML.');
      await paintQuickProgress('Preparing map preview…', 85);
      await loadDirectGeoJSON(data, file.name);
      return;
    } catch (err: any) {
      notice(`Failed to parse KML: ${err?.message || err}`);
      return;
    }
  }

  if (ext === '.pmtiles') {
    try {
      await loadDirectPMTiles(file);
      return;
    } catch (err: any) {
      notice(`Failed to load PMTiles: ${err?.message || err}`);
      return;
    }
  }

  if (ext === '.mbtiles') {
    try {
      await loadDirectMBTiles(file);
      return;
    } catch (err: any) {
      notice(`Failed to load MBTiles: ${err?.message || err}`);
      return;
    }
  }

  if (ext === '.tif' || ext === '.tiff') {
    try {
      await loadDirectTiff(file);
      return;
    } catch (err: any) {
      stopActiveTiff();
      notice(`Failed to load GeoTIFF: ${err?.message || err}`);
      return;
    }
  }

  notice(`"${file.name}" requires tiling. Use the Create tiles panel on the left to convert it to MBTiles.`);
}

// Keep the zoom readout in the lower-left corner, separate from navigation.
class ZoomLevelControl {
  private badge: HTMLElement | undefined;
  private value: HTMLElement | undefined;
  private tileLevel: HTMLElement | undefined;
  private target: import('maplibre-gl').Map | undefined;
  private render = () => {
    if (this.value && this.target) {
      const zoom = this.target.getZoom();
      this.value.textContent = zoom.toFixed(1);
      if (this.tileLevel) this.tileLevel.textContent = `Tile Z${Math.floor(zoom)}`;
      this.badge?.setAttribute('aria-label', `Map zoom ${zoom.toFixed(1)}, tile level ${Math.floor(zoom)}`);
    }
  };
  onAdd(map: import('maplibre-gl').Map) {
    this.target = map;
    const badge = document.createElement('div');
    badge.className = 'maplibregl-ctrl zoom-level-ctrl';
    badge.title = 'Current map zoom; Tile Z is the integer level for the current view. Source tiles may use a different level.';
    const label = document.createElement('span');
    label.className = 'zoom-label';
    label.textContent = 'Zoom';
    const value = document.createElement('span');
    value.className = 'zoom-val';
    const tileLevel = document.createElement('span');
    tileLevel.className = 'zoom-tile-level';
    this.tileLevel = tileLevel;
    badge.append(label, value, tileLevel);
    this.badge = badge;
    this.value = value;
    this.render();
    map.on('zoom', this.render);
    return badge;
  }
  onRemove() {
    this.target?.off('zoom', this.render);
    this.target = undefined;
    this.badge?.remove();
    this.badge = undefined;
    this.value = undefined;
    this.tileLevel = undefined;
  }
}

function addMapControls(maplibregl: typeof import('maplibre-gl'), map: import('maplibre-gl').Map) {
  map.addControl(new maplibregl.NavigationControl());
  map.addControl(new ZoomLevelControl(), 'bottom-left');
}

async function initMap() {
  try {
    const maplibregl = await loadMapLibre();
    stopActive3d();
    map?.remove();
    closeFeaturePopup();
    element('map').replaceChildren();
    ensureDropOverlay();
    const style = await buildMapStyle();
    map = new maplibregl.Map({
      container: 'map',
      style,
      center: [118.0, -2.5],
      zoom: 4,
    });
  addMapControls(maplibregl, map);
    map.on('error', event => console.warn('Map notice:', event.error?.message || event.error));
  } catch (err) {
    console.error('Failed to init map:', err);
  }
}

const JOB_LAYER_COLORS = ['#0f766e', '#2563eb', '#c2410c', '#7c3aed', '#be185d', '#4d7c0f', '#0891b2', '#a16207'];

async function waitForMapStyle(target: import('maplibre-gl').Map) {
  if (target.isStyleLoaded()) return;
  await new Promise<void>(resolve => target.once('load', () => resolve()));
}

async function addStandardJobMapLayer(job: Job) {
  const existing = jobMapLayers.get(job.id);
  if (existing) { existing.visible = true; setJobMapLayerAppearance(existing); updateJobMapLayerStatus(); zoomToJobMapLayer(job.id); return; }
  stopVisualCompare(); stopActiveTiff(); stopActive3d(); lastDirectData = null; activeJob = job;
  if (!jobMapLayers.size) await initMap();
  const target = map;
  if (!target) throw new Error('Map preview is unavailable.');
  await waitForMapStyle(target);
  if (map !== target) return;

  const vector = job.metadata?.kind === 'vector';
  const rawBounds = job.metadata?.bounds as number[] | undefined;
  const bounds = rawBounds?.length === 4 && rawBounds.every(Number.isFinite)
    ? [rawBounds[0]!, rawBounds[1]!, rawBounds[2]!, rawBounds[3]!] as [number, number, number, number]
    : null;
  const sourceId = `job-${job.id}`;
  const color = JOB_LAYER_COLORS[jobMapLayers.size % JOB_LAYER_COLORS.length]!;
  const source: any = {
    type: vector ? 'vector' : 'raster',
    tiles: [`${location.origin}/api/jobs/${job.id}/tiles/{z}/{x}/{y}`],
    minzoom: job.options.minZoom,
    maxzoom: job.options.maxZoom,
    ...(vector ? {} : { tileSize: 256 }),
    ...(bounds ? { bounds } : {}),
  };
  const layerIds: string[] = [];
  target.addSource(sourceId, source);
  try {
    if (!vector) {
      const id = `${sourceId}-raster`; layerIds.push(id);
      target.addLayer({ id, type: 'raster', source: sourceId, paint: { 'raster-opacity': 1, 'raster-fade-duration': 120 } });
    } else {
      const vectorLayers = (job.metadata?.vectorLayers && (job.metadata.vectorLayers as any[]).length > 0)
        ? job.metadata.vectorLayers as { id: string }[]
        : [{ id: 'features' }];
      for (const [index, vectorLayer] of vectorLayers.entries()) {
        const sourceLayer = vectorLayer.id || 'features';
        const prefix = `${sourceId}-${index}`;
        const fill = `${prefix}-fill`, line = `${prefix}-line`, point = `${prefix}-point`;
        target.addLayer({ id: fill, type: 'fill', source: sourceId, 'source-layer': sourceLayer, filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': color, 'fill-opacity': 0.45 } });
        target.addLayer({ id: line, type: 'line', source: sourceId, 'source-layer': sourceLayer, filter: ['!=', ['geometry-type'], 'Point'], paint: { 'line-color': color, 'line-width': 2 } });
        target.addLayer({ id: point, type: 'circle', source: sourceId, 'source-layer': sourceLayer, filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-color': color, 'circle-radius': 6, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#fff' } });
        layerIds.push(fill, line, point);
      }
    }
  } catch (error) {
    for (const id of [...layerIds].reverse()) { try { if (target.getLayer(id)) target.removeLayer(id); } catch { /* cleanup */ } }
    try { if (target.getSource(sourceId)) target.removeSource(sourceId); } catch { /* cleanup */ }
    throw error;
  }
  jobMapLayers.set(job.id, { job, sourceId, layerIds, bounds, visible: true, opacity: 1, color, vector });
  updateJobMapLayerStatus(jobMapLayers.size === 1);
}

async function preview(job: Job) {
  if (!job.metadata) return;
  if (!['elevation', 'scientific', 'model3d'].includes(String(job.metadata.kind))) {
    const queued = jobMapLayerQueue.then(() => addStandardJobMapLayer(job));
    jobMapLayerQueue = queued.catch(() => undefined);
    await queued;
    return;
  }
  stopVisualCompare();
  stopActiveTiff();
  clearMapDataLayers();
  activeJob = job;
  // Elevation, scientific, and 3D previews do not populate jobMapLayers.
  // They still render a selected dataset, so do not show the empty-map state.
  element('no-map-selected').hidden = true;
  lastDirectData = null;
  const maplibregl = await loadMapLibre();
  map?.remove();
  element('map').replaceChildren();
  ensureDropOverlay();

  if (job.metadata.kind === 'elevation' || job.metadata.kind === 'scientific') {
    const style = await buildMapStyle();
    const bounds = job.metadata.bounds as [number, number, number, number] | undefined;
    const terrain = job.metadata.kind === 'elevation' && ['terrain-rgb', 'terrarium'].includes(job.options.elevationOutput!);
    const previewMap = new maplibregl.Map({ container: 'map', style, ...(bounds ? { bounds, fitBoundsOptions: { padding: 40 } } : { center: [0, 0] as [number, number], zoom: 1 }), pitch: terrain ? 55 : 0 });
    map = previewMap; addMapControls(maplibregl, previewMap);
    previewMap.once('load', async () => {
      if (map !== previewMap) return;
      if (terrain) {
        previewMap.addSource('elevation', { type: 'raster-dem', tiles: [`${location.origin}/api/jobs/${job.id}/tiles/{z}/{x}/{y}`], tileSize: 256, encoding: job.options.elevationOutput === 'terrarium' ? 'terrarium' : 'mapbox', minzoom: job.options.minZoom, maxzoom: job.options.maxZoom, ...(bounds ? { bounds } : {}) });
        previewMap.setTerrain({ source: 'elevation', exaggeration: 1 });
        previewMap.addLayer({ id: 'elevation-hillshade', type: 'hillshade', source: 'elevation' });
      } else {
        try { const { showCog } = await import('./cog.js'); if (map === previewMap) await showCog(previewMap, maplibregl, job); }
        catch (error) { if (map === previewMap) notice(`COG preview: ${String(error)}`); }
      }
    });
    previewMap.on('error', event => notice(`${job.metadata?.kind === 'scientific' ? 'Scientific raster' : 'Elevation'} preview: ${event.error?.message ?? 'Tile could not be loaded.'}`));
    showLoadedBadge(job.filename, job.metadata?.kind === 'scientific' ? 'Scientific COG · numeric values preserved' : `${terrain ? job.options.elevationOutput === 'terrarium' ? 'Terrarium' : 'Terrain-RGB' : 'COG elevation'} · ${job.options.elevationKind?.toUpperCase()} · ${job.options.heightReference}`, bounds ?? null, undefined, true);
    notice(terrain ? `Missing terrain pixels use the chosen display height (${job.options.terrainNoDataHeight} m). Vertical heights have not been converted between datums.` : job.metadata?.kind === 'scientific' ? 'Scientific COG colors show the source range. NoData is transparent; pixels are loaded on demand with HTTP Range.' : 'COG elevation colors show source heights. NoData is transparent; pixels are loaded on demand with HTTP Range.');
    return;
  }

  if (job.metadata.kind === 'model3d') {
    const longitude = Number(job.metadata.longitude), latitude = Number(job.metadata.latitude);
    const style = await buildMapStyle();
    const previewMap = new maplibregl.Map({ container: 'map', style, center: [longitude, latitude], zoom: 18, pitch: 60, maxPitch: 85 });
    map = previewMap;
    addMapControls(maplibregl, previewMap);
    previewMap.once('load', async () => {
      if (map !== previewMap) return;
      try { const { show3dTiles } = await import('./model3d.js'); if (map === previewMap) active3dCleanup = show3dTiles(previewMap, job.id, message => notice(`3D tile failed: ${message}`)); }
      catch (error) { notice(`Could not load 3D preview: ${String(error)}`); }
    });
    previewMap.on('error', event => console.warn('3D map notice:', event.error?.message || event.error));
    const tileCount = typeof job.metadata.tiles === 'number' ? `${job.metadata.tiles} tiles` : '';
    const lod = typeof job.metadata.lodLevels === 'number' ? `${job.metadata.lodLevels} LOD level${job.metadata.lodLevels === 1 ? '' : 's'}` : '';
    showLoadedBadge(job.filename, ['3D Tiles', tileCount, lod, 'deck.gl + MapLibre'].filter(Boolean).join(' · '), [longitude, latitude, longitude, latitude], undefined, true);
    return;
  }
}
async function refresh() {
  if (!signedIn) return;
  try {
    const [status, jobs] = await Promise.all([api('/api/status').then(r => r.json()), api('/api/jobs').then(r => r.json())]);
    element('app-version').textContent = `v${status.version ?? '—'}`;
    productionReadOnly = status.productionReadOnly === true;
    repositoryUrl = typeof status.repositoryUrl === 'string' && status.repositoryUrl.startsWith('https://github.com/') ? status.repositoryUrl : 'https://github.com';
    if (productionReadOnly) {
      lockProductionDatasetPicker();
      const submit = element<HTMLButtonElement>('submit');
      submit.innerHTML = 'Clone to create tile jobs';
      submit.title = 'Production is preview-only. Clone TileO from GitHub to process datasets.';
    } else { unlockLocalDatasetPicker(); void loadIamTrustInfo(); void refreshByocList(); }
    element('sign-out').hidden = !status.authenticationRequired;
    if (status.basemapUrl !== undefined) {
      configuredBasemap = {
        url: status.basemapUrl || '',
        apiKey: status.basemapApiKey ?? '',
        attribution: status.basemapAttribution ?? '',
      };
      updateBasemapIndicator();
    }
    element('connection').textContent = status.workerOnline ? '● Worker connected' : '○ Worker offline — queued jobs are preserved';
    element('free-space').textContent = `${bytes(status.freeBytes)} disk space available`;
    element('tools').textContent = Object.entries(status.tools as Record<string, { available: boolean; version?: string; error?: string }>).map(([name, tool]) => `${tool.available ? 'OK' : 'MISSING'}  ${name}: ${tool.version ?? (tool.available ? 'available' : tool.error ?? 'unavailable')}`).join('\n') || 'Waiting for worker capability checks…';
    renderJobs(jobs);
  } catch (error) { element('connection').textContent = '○ Connection unavailable'; notice(error instanceof Error ? error.message : String(error)); }
}
const mapEl = element('map');
mapEl.addEventListener('dragenter', e => { e.preventDefault(); ensureDropOverlay().classList.add('active'); });
mapEl.addEventListener('dragover', e => { e.preventDefault(); ensureDropOverlay().classList.add('active'); });
mapEl.addEventListener('dragleave', e => {
  if (e.target === mapEl || e.target === document.getElementById('map-drop-overlay')) {
    ensureDropOverlay().classList.remove('active');
  }
});
mapEl.addEventListener('drop', async e => {
  e.preventDefault();
  ensureDropOverlay().classList.remove('active');
  const file = e.dataTransfer?.files?.[0];
  if (file) await handleDirectFile(file);
});
element<HTMLInputElement>('quick-file').addEventListener('change', async () => {
  const input = element<HTMLInputElement>('quick-file');
  const file = input.files?.[0];
  input.value = '';
  if (file) await handleDirectFile(file);
});
element('btn-recenter').addEventListener('click', () => zoomToCurrentExtent());
element('btn-landing-sample').addEventListener('click', () => { if (activeJob) openLandingSample(activeJob); });
element('btn-zoom-all-layers').addEventListener('click', () => {
  currentActiveBounds = combinedJobLayerBounds();
  currentViewport = { minZoom: 0, maxZoom: Math.max(...[...jobMapLayers.values()].filter(layer => layer.visible).map(layer => layer.job.options.maxZoom), 18) };
  zoomToCurrentExtent();
});
element('btn-clear-layers').addEventListener('click', () => element<HTMLButtonElement>('btn-clear-preview').click());
element('btn-toggle-layers').addEventListener('click', () => {
  const panel = element('map-layers-panel');
  const button = element<HTMLButtonElement>('btn-toggle-layers');
  const collapsed = panel.classList.toggle('is-collapsed');
  button.title = collapsed ? 'Expand layer panel' : 'Collapse layer panel';
  button.setAttribute('aria-label', button.title);
  button.setAttribute('aria-expanded', String(!collapsed));
  button.replaceChildren(iconEl(collapsed ? 'chevron-down' : 'chevron-up'));
});
element('btn-clear-preview').addEventListener('click', () => {
  stopActiveTiff();
  clearMapDataLayers();
  currentActiveBounds = null;
  currentViewport = { minZoom: 0, maxZoom: 18 };
  activeJob = null;
  lastDirectData = null;
  resetPreviewStatus();
  void initMap();
  renderJobs();
  notice('Map preview cleared.');
});
const mapResizeObserver = new ResizeObserver(() => {
  map?.resize();
});
mapResizeObserver.observe(mapEl);
window.addEventListener('resize', () => map?.resize());

updateDatasetFormState();
void initMap();
await refresh(); setInterval(() => void refresh(), 2500);


