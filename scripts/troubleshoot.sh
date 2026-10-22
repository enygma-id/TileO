#!/usr/bin/env bash
set +e
cd "$(dirname "${BASH_SOURCE[0]}")/.."
echo "== TileO troubleshoot =="
uname -a
for tool in node npm gdalinfo gdalwarp gdaladdo gdalsrsinfo ogrinfo ogr2ogr tippecanoe docker; do
  if command -v "$tool" >/dev/null 2>&1; then
    printf '%-12s ' "$tool"
    "$tool" --version 2>&1 | head -n 1
  else
    printf '%-12s %s\n' "$tool" MISSING
  fi
done
echo "== Environment =="
printf 'TILEO_DATA_DIR=%s\n' "${TILEO_DATA_DIR:-<unset>}"
printf 'TILEO_GDAL_BIN=%s\n' "${TILEO_GDAL_BIN:-<unset>}"
printf 'TILEO_TIPPECANOE_BIN=%s\n' "${TILEO_TIPPECANOE_BIN:-<unset>}"
echo "== GDAL MBTiles =="
gdalinfo --format MBTiles 2>&1 | head -n 12
echo "== TileO doctor =="
npm run doctor
