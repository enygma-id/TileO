$ErrorActionPreference = 'Continue'
Set-Location (Join-Path $PSScriptRoot '..')
Write-Host '== TileO troubleshoot ==' -ForegroundColor Cyan
Get-ComputerInfo -Property WindowsProductName,OsArchitecture | Format-List
foreach ($tool in @('node','npm','gdalinfo','gdalwarp','gdaladdo','gdalsrsinfo','ogrinfo','ogr2ogr','tippecanoe','docker')) {
  $command = Get-Command $tool -ErrorAction SilentlyContinue
  if ($command) {
    try { "$tool : $((& $command.Source --version 2>&1 | Select-Object -First 1))" } catch { "$tool : FOUND" }
  } else { "$tool : MISSING" }
}
Write-Host '== Environment ==' -ForegroundColor Cyan
"TILEO_DATA_DIR = $(if ($env:TILEO_DATA_DIR) { $env:TILEO_DATA_DIR } else { '<unset>' })"
"TILEO_GDAL_BIN = $(if ($env:TILEO_GDAL_BIN) { $env:TILEO_GDAL_BIN } else { '<unset>' })"
"TILEO_TIPPECANOE_BIN = $(if ($env:TILEO_TIPPECANOE_BIN) { $env:TILEO_TIPPECANOE_BIN } else { '<unset>' })"
Write-Host '== GDAL MBTiles ==' -ForegroundColor Cyan
gdalinfo --format MBTiles 2>&1 | Select-Object -First 12
Write-Host '== TileO doctor ==' -ForegroundColor Cyan
npm.cmd run doctor
