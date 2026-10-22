import { MapLibreOverlay } from '@deck.gl/maplibre';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import type { Map } from 'maplibre-gl';

export function show3dTiles(map: Map, id: string, onError: (message: string) => void, source = false) {
  const layer = new Tile3DLayer({
    id: 'preview-3d-tiles',
    data: `/api/jobs/${id}/${source ? 'source-tileset.json' : '3d/tileset.json'}`,
    onTilesetLoad: tileset => {
      if (source) return;
      if (!tileset.cartographicCenter) return;
      const longitude = tileset.cartographicCenter[0], latitude = tileset.cartographicCenter[1];
      if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
        map.easeTo({ center: [longitude!, latitude!], zoom: Math.min(20, Math.max(15, tileset.zoom || 18)), pitch: 60, duration: 500 });
      }
    },
    onTileError: (_tile, _url, message) => onError(String(message)),
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
