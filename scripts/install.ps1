param([switch]$Docker)
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
New-Item -ItemType Directory -Force tools | Out-Null

if ($Docker) {
  docker compose up -d --build
  docker compose exec worker node dist/doctor.js
  exit 0
}

$localGdal = Join-Path (Get-Location) 'tools\gdal\bin\gdal\apps\gdalinfo.exe'
$localTippecanoe = Join-Path (Get-Location) 'tools\bin\tippecanoe.exe'
$missing = @(
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) { 'node' }
  if (-not (Get-Command gdalinfo -ErrorAction SilentlyContinue) -and -not (Test-Path $localGdal)) { 'gdalinfo' }
)
if ($missing.Count) {
  Write-Host "Missing native tools: $($missing -join ', ')" -ForegroundColor Yellow
  Write-Host "Install Node.js 24 and GDAL, or use .\scripts\install.ps1 -Docker."
  exit 1
}

$tippecanoe = Get-Command tippecanoe -ErrorAction SilentlyContinue
if ((-not $tippecanoe -and -not (Test-Path $localTippecanoe)) -or (Test-Path (Join-Path (Get-Location) 'tools\bin\tippecanoe_runner.py') -and -not (Get-Command wsl.exe -ErrorAction SilentlyContinue))) {
  Write-Host 'Tippecanoe is not available as a Windows executable.' -ForegroundColor Yellow
  Write-Host 'TileO will use the GDAL fallback for vector jobs.'
  Write-Host 'For Tippecanoe, use WSL2 (bash scripts/install.sh) or .\scripts\install.ps1 -Docker.'
}

if (-not ((node --version) -match '^v24\.')) { throw 'Node.js 24.x is required.' }
npm.cmd ci
npm.cmd run build
npm.cmd run doctor
Write-Host 'TileO Windows installation is ready. Start with: npm.cmd start' -ForegroundColor Green
