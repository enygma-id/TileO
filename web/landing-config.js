// Landing page map content. Update these values to feature different jobs.
// Job tile URLs, bounds, zoom levels, and vector layer names are available in
// the matching job metadata from GET /api/jobs/:id.
window.TILEO_LANDING_CONFIG = {
  sample: {
    name: 'result.tif',
    url: '/api/jobs/ad54f573-de17-45e5-906b-7ee7404e928a/tiles/{z}/{x}/{y}',
    bounds: [112.62578317400437, -7.982124804497606, 112.63152142491562, -7.973524530362318],
    center: [112.62949, -7.97642],
    zoom: 18.71,
    minzoom: 5,
    maxzoom: 22,
    tiles: '5,745'
  },
  vector: {
    kind: 'vector',
    sourceLayer: 'features',
    name: 'Block Persil Polowijen Kota Malang.geojson',
    url: '/api/jobs/35458f8e-5e0d-412e-950e-3b52c4c92089/tiles/{z}/{x}/{y}',
    bounds: [112.63596, -7.939388, 112.660117, -7.92239],
    center: [112.64325, -7.92758],
    zoom: 16.98,
    minzoom: 5,
    maxzoom: 16,
    tiles: '34'
  }
};
