# Clean Export Guide

`npm run copy:clean` copies this project to another folder as a clean snapshot you can publish, archive, or turn into a new repository. Source, docs, and configuration are kept; local state, secrets, build output, and vendored tool binaries are skipped.

## Usage

```bash
npm run copy:clean -- /path/to/export
```

Run it from the project folder. On Windows use forward slashes in the target path (`/path/to/export`) so the command works from cmd, PowerShell, and git-bash. To run it from anywhere:

```bash
npm --prefix /path/to/TileO run copy:clean -- /path/to/export
```

### Options

| Option | Effect |
| --- | --- |
| `--dry-run` | Preview the export and print the report. Nothing is written. |
| `--force` | Merge into an existing non-empty folder. Extra files already there are left in place. |
| `--with-git` | Keep the `.git` repository history. |
| `--with-samples` | Keep the `samples/` payloads. |

Unknown options, a missing target, or extra arguments print the usage and exit with code 1.

## What is kept

- `src/`, `web/`, `scripts/`, browser specs, and `tools/.gitkeep`
- All documentation (`*.md`) and API/config examples (`openapi.yaml`, `compose.yaml`, `Dockerfile`, `.env.example`)
- Repository configuration (`package.json`, `package-lock.json`, `tsconfig.json`, `playwright.config.ts`) and dotfiles (`.gitignore`, `.gitattributes`, `.dockerignore`, `.github/workflows/`)

## What is skipped

| Category | Skipped |
| --- | --- |
| Build & runtime state | `node_modules/`, `dist/`, `data/`, `test-results/`, `playwright-report/`, `tippecanoe/` |
| Secrets & local notes | `.env` and `.env.*` (except `.env.example`), `*.log`, `session_.md`, `session.md` |
| Vendored tool binaries | `tools/gdal/`, `tools/bin/`, `tools/tippecanoe_musl/` |
| Samples | `samples/` (use `--with-samples`) |
| Repository history | `.git/` (use `--with-git`) |
| Misc | `*.tsbuildinfo`, `.DS_Store`, `Thumbs.db`, `nul` |

## Safety rails

- The target must be outside the project folder; the project folder itself or any folder inside it is refused.
- A non-empty target is refused unless `--force` is passed.
- Failures print `copy:clean - <message>` on stderr and exit with code 1.
- `--dry-run` never creates or changes anything on disk.

## Illustrative output (not a current benchmark)

Dry run:

```text
Clean export (dry run - nothing is written)
  source   D:\projects\TileO
  target   D:\exports\tileo
  files    <number of copied files>
  skipped  3 directories: .git, dist, node_modules
           1 files: .env
```

Real copy:

```text
Clean export complete.
  copied   <number of copied files> -> D:\exports\tileo
  next     cd "D:\exports\tileo" && git init -b main && git add -A && git commit -m "Initial commit"
```

## Typical workflow

1. Export the clean snapshot.

```bash
npm run copy:clean -- D:/exports/tileo
```

2. Turn the export into a repository.

```bash
cd D:/exports/tileo
git init -b main
git add -A
git commit -m "Initial commit"
```

3. Optionally publish the export to a new remote after reviewing its contents and licenses.

```bash
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

4. Run it from the export. `.env` is intentionally not copied; recreate it from the example:

```bash
cp .env.example .env
npm ci
npm run build
npm run doctor
npm start
```

If GDAL or Tippecanoe live outside the export, point the variables at an existing tool bundle:

```ini
TILEO_GDAL_BIN=D:\path\to\tools\gdal\bin\gdal\apps
TILEO_TIPPECANOE_BIN=D:\path\to\tools\bin
```

Alternatively, copy the `tools/` bundle into the export to enable auto-detection. See [TOOLS.md](TOOLS.md) for details. The data directory defaults to `<project>/data`.

## Related

- [README](../README.md) - Docker and native run instructions.
- [Tools](TOOLS.md) - GDAL and Tippecanoe prerequisites.
- `npm run doctor` - checks availability of required tools and selected capabilities.
