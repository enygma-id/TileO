// Classification only; arbitrary operator basemap URLs remain supported.
export function isOsmBasemap(value: string): boolean {
  if (value.toLowerCase() === 'osm' || value.startsWith('/api/basemap/osm/')) return true;
  try {
    const url = new URL(value);
    return url.hostname === 'openstreetmap.org' || url.hostname.endsWith('.openstreetmap.org');
  } catch { return false; }
}
