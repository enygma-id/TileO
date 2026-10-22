import { pathToFileURL } from 'node:url';
import { run } from './process.js';
export async function doctor() {
  const result: Record<string, { available: boolean; version?: string; error?: string }> = {};
  for (const tool of ['gdalinfo', 'gdal_translate', 'gdalwarp', 'gdaladdo', 'gdalsrsinfo', 'ogrinfo', 'ogr2ogr', 'tippecanoe']) {
    try {
      const text = await run(tool, ['--version'], { capture: true, combined: true, timeoutMs: 15000 });
      result[tool] = { available: true, version: text.trim() || 'Available (version printed to stderr)' };
    } catch (error) { result[tool] = { available: false, error: error instanceof Error ? error.message : String(error) }; }
  }
  try {
    const formats = await run('gdal_translate', ['--formats'], { capture: true, timeoutMs: 15000 });
    const available = /\bCOG\s+-/.test(formats);
    result.COG = { available, ...(available ? {} : { error: 'GDAL COG driver is missing.' }) };
    if (available) result.COG.version = 'GDAL COG driver';
  } catch (error) { result.COG = { available: false, error: String(error) }; }
  const gdalVersion = result.gdalinfo?.version?.match(/GDAL\s+(\d+)\.(\d+)/i);
  const vsiS3 = !!gdalVersion && (Number(gdalVersion[1]) > 2 || (Number(gdalVersion[1]) === 2 && Number(gdalVersion[2]) >= 2));
  result.VSIS3 = { available: vsiS3, ...(vsiS3 ? { version: 'GDAL /vsis3/ capability (live connection is verified per inspection)' } : { error: 'GDAL 2.2 or newer is required for /vsis3/.' }) };
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await doctor(); console.log(JSON.stringify(result, null, 2));
  if (Object.values(result).some(tool => !tool.available)) process.exitCode = 1;
}
