> **Implementation reference — TileO Clean 4, supplied 21 October 2026.** Commands and behavior are transcribed from the source document. This founding package has no runnable implementation; check the merged source before describing any behavior as release-certified.

# GDAL and Tippecanoe on Windows, macOS, and Linux

TileO needs GDAL for raster and vector input. Tippecanoe is the preferred vector tiler; Auto falls back to GDAL only when Tippecanoe cannot start and Density is selected. Preserve requires Tippecanoe. On Windows, GDAL can run natively; the official Tippecanoe project does not provide a native Windows installation, so use WSL2 or Docker for Tippecanoe.

DSM/DTM conversion uses the same native GDAL installation (`gdalinfo`, `gdal_translate`, `gdalwarp`, and the COG/ENVI drivers). It needs neither Tippecanoe nor an additional Python installation. Run `npm run doctor` to check COG support. Select Elevation in the UI to preserve Int16/Float32/Float64 values rather than scaling them to imagery. See [DSM / DTM distribution](IMPLEMENTATION_REFERENCE.md#dsm--dtm-distribution) for output choices and NoData handling.

### Manual COG check

`npm run doctor` only checks that GDAL advertises the COG driver. To verify a real file, run these commands from the project folder:

```powershell
gdalinfo --format COG
gdalinfo -json -checksum -stats .\path\input.tif > .\cog-source.json
gdal_translate -of COG -co COMPRESS=DEFLATE -co PREDICTOR=YES -co BLOCKSIZE=512 -co BIGTIFF=IF_SAFER .\path\input.tif .\path\checked-cog.tif
gdalinfo -json -checksum .\path\checked-cog.tif > .\cog-result.json
```

In `cog-result.json`, confirm `driverShortName` is `GTiff`, `metadata.IMAGE_STRUCTURE.LAYOUT` is `COG`, the raster `size`, `geoTransform`, band `type`, `checksum`, `noDataValue`, `scale`, `offset`, and `unit` match the source, and large rasters contain band `overviews`. A quick one-line check is:

```powershell
gdalinfo .\path\checked-cog.tif | Select-String 'LAYOUT=COG|COMPRESSION=DEFLATE|Overviews|Size is|Coordinate System'
```

macOS/Linux use the same commands with `/path/to/input.tif` and `./checked-cog.tif`. The COG driver being available does not prove that every input is valid; this file-level check is the reliable manual verification.

## Helper tools: start here

Windows PowerShell (native GDAL, optional Tippecanoe):

```powershell
.\scripts\install.ps1
.\scripts\troubleshoot.ps1
```

macOS/Linux:

```sh
bash scripts/install.sh
bash scripts/troubleshoot.sh
```

If native Windows Tippecanoe is unavailable, use WSL2 and run `bash scripts/install.sh` inside Ubuntu. Docker is also available with `.\scripts\install.ps1 -Docker` on Windows or `bash scripts/install.sh --docker` on macOS/Linux.

The Windows installer requires Node.js 24 and GDAL. Missing native Tippecanoe is reported as a warning, not an installation failure; Density vector jobs can then use the GDAL fallback.

## Docker Compose fallback

From the `tileo-ts` directory:

```sh
docker compose up -d --build
docker compose exec worker node dist/doctor.js
```

The image includes Linux GDAL and Tippecanoe. On Windows, use Docker Linux containers.

## Native installation

Use Node.js 24.13+ within major version 24 and GDAL 3.8+ with MBTiles/WebP support. Tippecanoe is optional on Windows because TileO falls back to GDAL for vector jobs.

### Windows native GDAL

Place native Windows bundles inside the project:

```text
tileo-ts/tools/gdal/bin/gdal/apps/gdalinfo.exe
```

Then run `.\scripts\install.ps1`. It checks Node.js and GDAL, installs npm dependencies, builds TileO, and runs `npm run doctor`. Docker is not required for raster jobs or vector jobs using the GDAL fallback.

If the tools folder is outside this project, set the paths before starting TileO:

```powershell
$env:TILEO_GDAL_BIN = 'D:\Kerja\TilesO\tools\gdal\bin\gdal\apps'
$env:TILEO_TIPPECANOE_BIN = 'D:\Kerja\TilesO\tools\bin'
```

Do not copy the Linux Tippecanoe binary into `tools/bin`. A Windows wrapper may be used only when WSL2 is installed and working. Otherwise use WSL2 directly or Docker.

For WSL2, install Ubuntu once from an elevated PowerShell with `wsl --install -d Ubuntu`, open the project from the WSL terminal, and run `bash scripts/install.sh`. Keep the project and `node_modules` inside the Linux filesystem when possible.

### macOS

```sh
brew install node@24 gdal tippecanoe
brew link --overwrite --force node@24
```

### Ubuntu/Debian

```sh
sudo apt update
sudo apt install -y build-essential git libsqlite3-dev zlib1g-dev gdal-bin libgdal-dev
sudo apt install -y tippecanoe
```

If the Tippecanoe package is unavailable, build version 2.79.0 from the source commands in the Dockerfile.

Install Node 24 with your team's version manager. With `nvm`:

```sh
nvm install 24.13.1
nvm use 24.13.1
```

### Common setup

From the `tileo-ts` directory:

```sh
gdalinfo --version
gdalinfo --format MBTiles
tippecanoe --version
npm ci
npm run build
npm run doctor
npm start
```

## Executable lookup

TileO uses `PATH`, or these directories when set:

| Variable | Contents |
| --- | --- |
| `TILEO_GDAL_BIN` | GDAL executables |
| `TILEO_TIPPECANOE_BIN` | Tippecanoe executable |

On Windows, `tools/gdal/bin/gdal/apps` and `tools/bin` inside the project are detected automatically. Keep bundles native to the current OS and CPU architecture. Linux binaries, `.cmd` wrappers, and copied Windows executables are not interchangeable.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `TOOL_MISSING` | Run `scripts/troubleshoot.*` and `npm run doctor` in the worker environment |
| Invalid Win32 application / exec format error | Install a binary for the current OS and CPU architecture |
| Missing DLL/shared library | Install the complete tool bundle |
| `proj.db` error | Match `GDAL_DATA` and `PROJ_DATA` to the same GDAL/PROJ install |
| `INVALID_CRS` | Clear Source CRS when the file already contains the correct CRS |
| WebP unavailable | Check `gdalinfo --format MBTiles`; use PNG if needed |
| Windows Tippecanoe missing | Use GDAL fallback, WSL2, or Docker; upstream does not provide a native Windows install |
| `MEMORY_LIMIT` | Raise `TILEO_TOOL_MEMORY_MB` only when the host has enough RAM |

References: [GDAL downloads](https://gdal.org/en/stable/download.html), [MBTiles](https://gdal.org/en/stable/drivers/raster/mbtiles.html), [Tippecanoe](https://github.com/felt/tippecanoe).
