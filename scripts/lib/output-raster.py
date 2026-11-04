"""File validators used by the independent conformance gate (Python + GDAL)."""
import argparse
import hashlib
import json
import math
import os
import pathlib
import shutil
import sqlite3
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from osgeo import gdal
from osgeo_utils.samples.validate_cloud_optimized_geotiff import validate

gdal.UseExceptions()
gdal.SetConfigOption('GDAL_PAM_ENABLED', 'NO')
p = argparse.ArgumentParser()
p.add_argument('--input', required=True)
p.add_argument('--kind', choices=['cog', 'mbtiles'], required=True)
p.add_argument('--report-dir', required=True)
p.add_argument('--ets')
p.add_argument('--reference')
p.add_argument('--encoding', choices=['terrain-rgb', 'terrarium'])
args = p.parse_args()
path = pathlib.Path(args.input).resolve()
out = pathlib.Path(args.report_dir).resolve()
out.mkdir(parents=True, exist_ok=True)
result = {'status': 'passed', 'errors': []}

def raster_digest(ds):
    digest = hashlib.sha256()
    for i in range(1, ds.RasterCount + 1):
        band = ds.GetRasterBand(i)
        for y in range(0, ds.RasterYSize, 256):
            for x in range(0, ds.RasterXSize, 256):
                digest.update(band.ReadRaster(x, y, min(256, ds.RasterXSize-x), min(256, ds.RasterYSize-y)))
    return digest.hexdigest()

def band_metadata(ds):
    return [(b.DataType, str(b.GetNoDataValue()), 1 if b.GetScale() is None else b.GetScale(), b.GetOffset() or 0, b.GetUnitType()) for b in [ds.GetRasterBand(i) for i in range(1, ds.RasterCount+1)]]

try:
    if args.kind == 'cog':
        warnings, errors, details = validate(str(path), full_check=True)
        result.update(warnings=warnings, errors=errors, layout=details)
        ds = gdal.Open(str(path))
        result['pixel_sha256'] = raster_digest(ds)
        if args.reference:
            source = gdal.Open(args.reference)
            if (source.RasterXSize, source.RasterYSize, source.RasterCount) != (ds.RasterXSize, ds.RasterYSize, ds.RasterCount) or raster_digest(source) != result['pixel_sha256'] or source.GetGeoTransform() != ds.GetGeoTransform() or not source.GetSpatialRef().IsSame(ds.GetSpatialRef()) or band_metadata(source) != band_metadata(ds):
                result['errors'].append('COG pixels, metadata, or georeference differ from the reference')
        if args.ets:
            if hasattr(os, 'geteuid') and os.geteuid() == 0:
                raise RuntimeError('Run the released GeoTIFF ETS as an unprivileged user with tiffdump already installed')
            # The ETS invokes tiffdump through a shell. Stage a fixed, safe name
            # so a user-controlled input path is never passed to that shell.
            with tempfile.TemporaryDirectory(prefix='tileo-geotiff-') as work:
                subject = pathlib.Path(work) / 'subject.tif'
                shutil.copyfile(path, subject)
                props = out / 'geotiff-properties.xml'
                tree = ET.Element('properties')
                ET.SubElement(tree, 'entry', key='iut').text = subject.as_uri()
                ET.SubElement(tree, 'entry', key='ics').text = ''
                ET.ElementTree(tree).write(props, encoding='utf-8')
                with (out / 'geotiff.log').open('w') as log:
                    run = subprocess.run([os.environ.get('JAVA', 'java'), '-jar', args.ets, '-o', str(out), str(props)], stdout=log, stderr=subprocess.STDOUT, timeout=90)
                reports = sorted(out.rglob('testng-results.xml'), key=lambda f: f.stat().st_mtime)
                if run.returncode or not reports:
                    result['errors'].append('OGC GeoTIFF ETS did not produce a successful test run')
                else:
                    counts = ET.parse(reports[-1]).getroot().attrib
                    result['ets'] = counts
                    if int(counts.get('failed', '1')) or int(counts.get('skipped', '1')) or int(counts.get('passed', '0')) == 0:
                        result['errors'].append('OGC GeoTIFF ETS has failures, skips, or no passed tests')
    else:
        db = sqlite3.connect(path.as_uri() + '?mode=ro', uri=True)
        if [x[0] for x in db.execute('PRAGMA integrity_check')] != ['ok']:
            result['errors'].append('SQLite integrity_check failed')
        meta = dict(db.execute('SELECT name,value FROM metadata'))
        if not all(k in meta for k in ['name', 'format']):
            result['errors'].append('Missing required MBTiles metadata')
        duplicates = db.execute('SELECT count(*) FROM (SELECT 1 FROM tiles GROUP BY zoom_level,tile_column,tile_row HAVING count(*)>1)').fetchone()[0]
        if duplicates:
            result['errors'].append('Duplicate tile coordinates')
        count = 0
        decoded = 0
        heights = set()
        for z, x, y, data in db.execute('SELECT zoom_level,tile_column,tile_row,tile_data FROM tiles'):
            count += 1
            if not (0 <= z <= 22 and 0 <= x < 2 ** z and 0 <= y < 2 ** z and data):
                result['errors'].append('Invalid tile coordinate or empty payload')
                continue
            if meta['format'] == 'pbf':
                continue  # The Node MVT decoder checks every feature separately.
            virtual = '/vsimem/tileo-validation-tile'
            try:
                gdal.FileFromMemBuffer(virtual, data)
                tile = gdal.Open(virtual)
                if tile.RasterXSize != 256 or tile.RasterYSize != 256:
                    result['errors'].append('Unexpected tile dimensions')
                pixels = tile.ReadRaster()
                if not pixels:
                    result['errors'].append('Raster tile could not be decoded')
                decoded += 1
                if args.encoding:
                    r, g, b = [tile.GetRasterBand(i).ReadRaster() for i in [1, 2, 3]]
                    for red, green, blue in zip(r, g, b):
                        height = (-10000 + (red * 65536 + green * 256 + blue) * .1) if args.encoding == 'terrain-rgb' else red * 256 + green + blue / 256 - 32768
                        if not math.isfinite(height):
                            result['errors'].append('Non-finite terrain height')
                        if len(heights) < 32:
                            heights.add(height)
            finally:
                tile = None
                gdal.Unlink(virtual)
        if not count:
            result['errors'].append('No tiles')
        result.update(tiles=count, decoded=decoded, format=meta.get('format'))
        if heights:
            result['height_samples'] = sorted(heights)
        db.close()
except Exception as error:
    result['errors'].append(str(error))
if result['errors']:
    result['status'] = 'failed'
print(json.dumps(result))
raise SystemExit(0 if result['status'] == 'passed' else 1)
