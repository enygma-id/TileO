import type { Job } from './types.js';
import { terrainGrid } from './elevation.js';
export const tileMime = (job: Job) => job.options.pipeline === 'elevation' || job.metadata?.format === 'png' ? 'image/png' : job.metadata?.format === 'pbf' ? 'application/vnd.mapbox-vector-tile' : job.metadata?.format === 'webp' ? 'image/webp' : 'image/jpeg';
const xml = (value: unknown) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);
export function capabilities(job: Job, url: string) {
  const bounds = job.metadata?.bounds as number[] | undefined;
  const matrices: string[] = [], limits: string[] = [];
  for (let z = job.options.minZoom; z <= job.options.maxZoom; z++) {
    const n = 2 ** z;
    matrices.push(`<TileMatrix><ows:Identifier>${z}</ows:Identifier><ScaleDenominator>${559082264.0287178 / n}</ScaleDenominator><TopLeftCorner>-20037508.342789244 20037508.342789244</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>${n}</MatrixWidth><MatrixHeight>${n}</MatrixHeight></TileMatrix>`);
    let grid = { x0: 0, x1: n - 1, y0: 0, y1: n - 1 };
    if (bounds) { try { grid = terrainGrid(bounds, z); } catch { /* Use world limits for extents outside Mercator. */ } }
    limits.push(`<TileMatrixLimits><TileMatrix>${z}</TileMatrix><MinTileRow>${grid.y0}</MinTileRow><MaxTileRow>${grid.y1}</MaxTileRow><MinTileCol>${grid.x0}</MinTileCol><MaxTileCol>${grid.x1}</MaxTileCol></TileMatrixLimits>`);
  }
  const operations = ['GetCapabilities', 'GetTile'].map(name => `<ows:Operation name="${name}"><ows:DCP><ows:HTTP><ows:Get xlink:href="${xml(url)}?"><ows:Constraint name="GetEncoding"><ows:AllowedValues><ows:Value>KVP</ows:Value></ows:AllowedValues></ows:Constraint></ows:Get></ows:HTTP></ows:DCP></ows:Operation>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><Capabilities xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0.0"><ows:ServiceIdentification><ows:Title>TileO WMTS</ows:Title><ows:ServiceType>OGC WMTS</ows:ServiceType><ows:ServiceTypeVersion>1.0.0</ows:ServiceTypeVersion></ows:ServiceIdentification><ows:OperationsMetadata>${operations}</ows:OperationsMetadata><Contents><Layer><ows:Title>${xml(job.filename)}</ows:Title>${bounds ? `<ows:WGS84BoundingBox><ows:LowerCorner>${bounds[0]} ${bounds[1]}</ows:LowerCorner><ows:UpperCorner>${bounds[2]} ${bounds[3]}</ows:UpperCorner></ows:WGS84BoundingBox>` : ''}<ows:Identifier>${job.id}</ows:Identifier><Style isDefault="true"><ows:Identifier>default</ows:Identifier></Style><Format>${tileMime(job)}</Format><TileMatrixSetLink><TileMatrixSet>WebMercatorQuad</TileMatrixSet><TileMatrixSetLimits>${limits.join('')}</TileMatrixSetLimits></TileMatrixSetLink></Layer><TileMatrixSet><ows:Identifier>WebMercatorQuad</ows:Identifier><ows:SupportedCRS>urn:ogc:def:crs:EPSG::3857</ows:SupportedCRS>${matrices.join('')}</TileMatrixSet></Contents></Capabilities>`;
}
export function wmtsException(message: string, code = 'InvalidParameterValue') { return `<?xml version="1.0"?><ows:ExceptionReport xmlns:ows="http://www.opengis.net/ows/1.1" version="1.0.0"><ows:Exception exceptionCode="${code}"><ows:ExceptionText>${xml(message)}</ows:ExceptionText></ows:Exception></ows:ExceptionReport>`; }
