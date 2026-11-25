import { MapLibreOverlay } from '@deck.gl/maplibre';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import type { Map } from 'maplibre-gl';
import { repairPreviewTransforms } from './tileset-preview-transforms.js';

type PreviewTile = {
  header: { boundingVolume?: { region?: number[] } };
  children: PreviewTile[];
};

function detailBounds(root: PreviewTile): [[number, number], [number, number]] | undefined {
  let bestDepth = 0;
  let bounds: [[number, number], [number, number]] | undefined;
  const pending = [{ tile: root, depth: 0 }];
  while (pending.length) {
    const { tile, depth } = pending.pop()!;
    const region = tile.header.boundingVolume?.region;
    if (depth > bestDepth && region?.length === 6) {
      const [west, south, east, north] = region.slice(0, 4).map(value => value * 180 / Math.PI) as [number, number, number, number];
      if ([west, south, east, north].every(Number.isFinite) && east !== west && north > south) {
        bounds = [[west, south], [east < west ? east + 360 : east, north]];
        bestDepth = depth;
      }
    }
    for (let i = tile.children.length - 1; i >= 0; i--) {
      pending.push({ tile: tile.children[i]!, depth: depth + 1 });
    }
  }
  return bounds;
}

export function show3dTiles(map: Map, id: string, onError: (message: string) => void, source = false, camera: 'model' | 'archive' | 'fixed' = 'model') {
  const data = `/api/jobs/${id}/${source ? 'source-tileset.json' : '3d/tileset.json'}`;
  const previewManifest = new URL(data, location.href).href;
  const layer = new Tile3DLayer({
    id: 'preview-3d-tiles',
    data,
    loadOptions: {
      ...(!source && camera !== 'model' ? {
        core: {
          fetch: async (url: string, options?: RequestInit) => {
            const response = await fetch(url, options);
            if (!response.ok || new URL(url, location.href).href !== previewManifest) return response;
            const manifest = await response.clone().json();
            if (!repairPreviewTransforms(manifest.root)) return response;
            const repaired = new Response(JSON.stringify(manifest), { headers: { 'Content-Type': 'application/json' } });
            // The loader uses the response URL to resolve relative tile URLs.
            Object.defineProperty(repaired, 'url', { value: response.url });
            return repaired;
          },
        },
      } : {}),
      workerUrl: '/draco-worker.js',
      modules: {
        'draco_wasm_wrapper.js': '/draco_wasm_wrapper.js',
        'draco_decoder.wasm': '/draco_decoder.wasm',
      },
      draco: { workerUrl: '/draco-worker.js' },
      tileset: { maximumMemoryUsage: 256, maximumScreenSpaceError: 8,
      throttleRequests: true, maxRequests: 4, memoryAdjustedScreenSpaceError: false } },
    onTilesetLoad: tileset => {
      if (source) return;
      if (camera !== 'model' && tileset.root) {
        const bounds = detailBounds(tileset.root);
        const view = bounds && map.cameraForBounds(bounds, { padding: 64, maxZoom: 18 });
        if (view) {
          map.easeTo({ ...view, duration: 500 });
          return;
        }
      }
      if (camera === 'fixed') return;
      if (!tileset.cartographicCenter) return;
      const longitude = tileset.cartographicCenter[0], latitude = tileset.cartographicCenter[1];
      if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
        map.easeTo({ center: [longitude!, latitude!], zoom: Math.min(20, Math.max(camera === 'archive' ? 0 : 15, tileset.zoom || 18)), pitch: 60, duration: 500 });
      }
    },
    onTileError: (_tile, message, url) => onError(`${message || 'Tile request or parsing failed.'}${url ? ` (${url})` : ''}`),
  });
  const overlay = new MapLibreOverlay({ interleaved: true, layers: [layer] });
  map.addControl(overlay);
  let removed = false;
  const cleanup = () => {
    if (removed) return;
    removed = true;
    map.off('remove', cleanup);
    overlay.finalize();
  };
  map.once('remove', cleanup);
  return cleanup;
}
