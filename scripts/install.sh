#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
mkdir -p tools

if [[ "${1:-}" == "--docker" ]]; then
  docker compose up -d --build
  docker compose exec worker node dist/doctor.js
  exit 0
fi

install_tools() {
  if command -v brew >/dev/null 2>&1; then
    brew install node@24 gdal tippecanoe
    brew link --overwrite --force node@24 || true
    return
  fi
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y build-essential git libsqlite3-dev zlib1g-dev gdal-bin libgdal-dev
    if ! command -v tippecanoe >/dev/null 2>&1; then
      if ! sudo apt-get install -y tippecanoe; then
        rm -rf /tmp/tileo-tippecanoe
        git clone --depth 1 --branch 2.79.0 https://github.com/felt/tippecanoe.git /tmp/tileo-tippecanoe
        make -C /tmp/tileo-tippecanoe -j2
        sudo make -C /tmp/tileo-tippecanoe install
      fi
    fi
    return
  fi
  echo "No supported package manager found. Use Docker: ./scripts/install.sh --docker" >&2
  exit 1
}

install_tools
command -v node >/dev/null 2>&1 || { echo "Install Node.js 24.13+ first (nvm is recommended)." >&2; exit 1; }
npm ci
npm run build
npm run doctor
echo "TileO native installation is ready. Start with: npm start"
