// The dataset and view settings live in web/landing-config.js.
const { sample: SAMPLE, vector: VECTOR } = window.TILEO_LANDING_CONFIG;

// Resolve endpoints from configured domain, query param, or current origin.
// ponytail: prioritize configured domain from meta tag, query param, or window variable before location.origin.
const domainMeta = typeof document !== 'undefined' ? document.querySelector('meta[name="tileo-domain"]')?.getAttribute('content')?.trim() : null;
const configuredDomain = domainMeta || (typeof location !== 'undefined' ? new URLSearchParams(location.search).get('domain') : null) || (typeof window !== 'undefined' ? window.TILEO_DOMAIN : '') || '';
const requestedBase = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('base') : null;
const basePath = requestedBase ? `/${requestedBase.replace(/^\/+|\/+$/g, '')}/` : '/';
const originBase = typeof location !== 'undefined' ? location.origin : 'http://localhost';
const serviceBase = configuredDomain ? new URL(basePath, configuredDomain.replace(/\/+$/, '') + '/') : new URL(basePath, originBase);
const serviceUrl = (path) => new URL(path.replace(/^\/+/, ''), serviceBase).href
  .replace(/%7B/gi, '{').replace(/%7D/gi, '}');
// MapLibre's default is `same-origin`; when the landing page is hosted on a
// different subdomain than the TileO API, that omits the HttpOnly session
// cookie from tile requests. Include credentials only for TileO API URLs.
const tileRequest = (url) => {
  try {
    const requestUrl = new URL(url, location.href);
    if (requestUrl.origin === serviceBase.origin && requestUrl.pathname.startsWith(new URL('/api/', serviceBase).pathname)) {
      return { url: requestUrl.href, credentials: 'include' };
    }
  } catch { /* let MapLibre handle non-URL resources normally */ }
  return { url };
};
SAMPLE.url = serviceUrl(SAMPLE.url);
VECTOR.url = serviceUrl(VECTOR.url);
const mapLibreModuleUrl = (typeof window !== 'undefined' && window.MAPLIBRE_URL) || serviceUrl('/maplibre-gl.mjs');
const mapLibreWorkerUrl = (typeof window !== 'undefined' && window.MAPLIBRE_WORKER_URL) || serviceUrl('/maplibre-gl-worker.mjs');

async function createSession(token = '') {
  const response = await fetch(serviceUrl('/api/session'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(token ? { token } : {})
  });
  return response.ok;
}

async function updateRepositoryLink() {
  const links = document.querySelectorAll('[data-repository-link]');
  if (!links.length) return;
  try {
    const response = await fetch(serviceUrl('/api/status'), { credentials: 'include' });
    if (!response.ok) return;
    const status = await response.json();
    if (typeof status.repositoryUrl === 'string' && status.repositoryUrl.startsWith('https://github.com/')) {
      links.forEach((link) => { link.href = status.repositoryUrl; });
    }
  } catch { /* keep the GitHub fallback when status is unavailable */ }
}

async function initializeLandingMaps() {
const hero = document.querySelector('.hero');
const container = document.getElementById('landing-map');
const sampleIsVector = SAMPLE.kind === 'vector';
const sampleLayerName = SAMPLE.sourceLayer || 'features';

if (hero && container) {
  try {
    const maplibregl = await import(mapLibreModuleUrl);
    const basemapUrl = (typeof window.TILEO_BASEMAP_URL === 'string' ? window.TILEO_BASEMAP_URL : (SAMPLE.basemap ? '/api/basemap/osm/{z}/{x}/{y}.png' : '')).trim();
    const hasBasemap = Boolean(basemapUrl && basemapUrl !== 'none' && basemapUrl !== 'off');
    maplibregl.setWorkerUrl(mapLibreWorkerUrl);
    const map = new maplibregl.Map({
      container,
      transformRequest: tileRequest,
      center: SAMPLE.center || [119.38, -5.13],
      zoom: typeof SAMPLE.zoom === 'number' ? SAMPLE.zoom : 14,
      interactive: false,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          ...(hasBasemap ? {
            basemap: {
              type: 'raster',
              tiles: [serviceUrl(basemapUrl)],
              tileSize: 256,
              attribution: window.TILEO_BASEMAP_ATTRIBUTION || (basemapUrl.includes('/api/basemap/osm') ? '© OpenStreetMap contributors' : '')
            }
          } : {}),
          sample: {
            type: sampleIsVector ? 'vector' : 'raster',
            tiles: [SAMPLE.url],
            minzoom: typeof SAMPLE.minzoom === 'number' ? SAMPLE.minzoom : 0,
            maxzoom: typeof SAMPLE.maxzoom === 'number' ? SAMPLE.maxzoom : 22
          }
        },
        layers: [
          ...(hasBasemap ? [{ id: 'basemap', type: 'raster', source: 'basemap' }] : [{ id: 'background', type: 'background', paint: { 'background-color': '#0b131e' } }]),
          ...(sampleIsVector ? [
            { id: 'sample-fill', type: 'fill', source: 'sample', 'source-layer': sampleLayerName, filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': '#0f766e', 'fill-opacity': 0.42 } },
            { id: 'sample-line', type: 'line', source: 'sample', 'source-layer': sampleLayerName, filter: ['!=', ['geometry-type'], 'Point'], paint: { 'line-color': '#99f6e4', 'line-width': 2 } },
            { id: 'sample-point', type: 'circle', source: 'sample', 'source-layer': sampleLayerName, filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-color': '#99f6e4', 'circle-radius': 5, 'circle-stroke-color': '#091823', 'circle-stroke-width': 1 } }
          ] : [
            { id: 'sample', type: 'raster', source: 'sample', paint: { 'raster-fade-duration': 300 } }
          ])
        ]
      }
    });
    window.map = map;
    map.on('error', () => { /* keep the page quiet when tiles are missing */ });
    let ready = false;
    const applyView = () => {
      if (typeof SAMPLE.zoom === 'number' && Array.isArray(SAMPLE.center)) {
        map.jumpTo({ center: SAMPLE.center, zoom: SAMPLE.zoom });
      } else if (Array.isArray(SAMPLE.bounds)) {
        map.fitBounds(SAMPLE.bounds, { padding: 40 });
      }
    };
    map.on('load', () => {
      ready = true;
      applyView();
      const badge = document.createElement('p');
      badge.className = 'hero-sample';
      badge.textContent = `Sample · ${SAMPLE.name} · ${SAMPLE.tiles} tiles produced by TileO`;
      hero.appendChild(badge);
    });
    applyView();
    setTimeout(() => { if (!ready) hero.classList.add('landing-no-map'); }, 9000);
  } catch {
    hero.classList.add('landing-no-map');
  }
}

const statementContainer = document.getElementById('statement-vector');
if (statementContainer) {
  try {
    const maplibregl = await import(mapLibreModuleUrl);
    maplibregl.setWorkerUrl(mapLibreWorkerUrl);
    const statementMap = new maplibregl.Map({
      container: statementContainer,
      transformRequest: tileRequest,
      center: VECTOR.center || [119.4245, -5.1415],
      zoom: typeof VECTOR.zoom === 'number' ? VECTOR.zoom - 0.9 : 12.7,
      interactive: false,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          parcels: {
            type: 'vector',
            tiles: [VECTOR.url],
            minzoom: typeof VECTOR.minzoom === 'number' ? VECTOR.minzoom : 0,
            maxzoom: typeof VECTOR.maxzoom === 'number' ? VECTOR.maxzoom : 22
          }
        },
        layers: [
          {
            id: 'parcel-fill',
            type: 'fill',
            source: 'parcels',
            'source-layer': VECTOR.sourceLayer,
            paint: { 'fill-color': '#4d7c78', 'fill-opacity': 0.05 }
          },
          {
            id: 'parcel-line',
            type: 'line',
            source: 'parcels',
            'source-layer': VECTOR.sourceLayer,
            paint: { 'line-color': '#4d7c78', 'line-width': 1, 'line-opacity': 0.3 }
          }
        ]
      }
    });
    statementMap.on('error', () => { /* the backdrop is decorative; stale tiles stay hidden */ });
  } catch {
    statementContainer.remove();
  }
}
}

// The exporter may inject a token into the generated static site. It is
// intentionally absent from the source template and is exchanged for a
// short-lived HttpOnly session before any map tiles are requested.
try {
  const sessionReady = await createSession(window.TILEO_ACCESS_TOKEN || '');
  const landingTasks = [updateRepositoryLink()];
  if (sessionReady) landingTasks.push(initializeLandingMaps());
  await Promise.allSettled(landingTasks);
} catch (error) {
  console.error('TileO landing could not create an authenticated session.', error);
}
