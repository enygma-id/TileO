FROM node:24.13.1-trixie-slim AS gdal
# Minimal, reproducible GDAL/PROJ profile. Optional drivers and optional external
# libraries stay OFF so the runtime image contains only what TileO invokes and
# the input formats TileO accepts. CLI apps: gdalinfo, gdal_translate, gdalwarp,
# gdaladdo, ogrinfo, ogr2ogr, gdalsrsinfo.
ARG GDAL_VERSION=3.11.4
ARG PROJ_VERSION=9.6.2
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential cmake ninja-build ca-certificates curl sqlite3 \
      libsqlite3-dev zlib1g-dev libpng-dev libjpeg62-turbo-dev \
      libwebp-dev libopenjp2-7-dev libexpat1-dev libflatbuffers-dev \
      libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/*

# PROJ is required for reprojection (gdalwarp -t_srs, EPSG lookups).
RUN curl -fsSL "https://download.osgeo.org/proj/proj-${PROJ_VERSION}.tar.gz" -o /tmp/proj.tar.gz \
    && mkdir -p /tmp/proj && tar -xzf /tmp/proj.tar.gz -C /tmp/proj --strip-components=1 \
    && cmake -S /tmp/proj -B /tmp/proj/build -G Ninja \
       -DCMAKE_BUILD_TYPE=Release \
       -DCMAKE_INSTALL_PREFIX=/usr/local \
       -DBUILD_TESTING=OFF \
       -DENABLE_TIFF=OFF \
       -DENABLE_CURL=OFF \
       -DBUILD_PROJSYNC=OFF \
    && cmake --build /tmp/proj/build -j"$(nproc)" \
    && cmake --install /tmp/proj/build \
    && rm -rf /tmp/proj /tmp/proj.tar.gz

# GDAL core: MIT-style. Drivers are limited to TileO's documented inputs:
# rasters (GeoTIFF/COG, ENVI, PNG, JPEG, WebP, JPEG2000, HFA/IMG, VRT, MBTiles,
# XYZ) and vectors (GeoJSON/Seq, GPKG, FlatGeobuf, ESRI Shapefile, KML, MBTiles).
RUN curl -fsSL "https://download.osgeo.org/gdal/${GDAL_VERSION}/gdal-${GDAL_VERSION}.tar.gz" -o /tmp/gdal.tar.gz \
    && mkdir -p /tmp/gdal && tar -xzf /tmp/gdal.tar.gz -C /tmp/gdal --strip-components=1 \
    && cmake -S /tmp/gdal -B /tmp/gdal/build -G Ninja \
       -DCMAKE_BUILD_TYPE=Release \
       -DCMAKE_INSTALL_PREFIX=/usr/local \
       -DBUILD_TESTING=OFF \
       -DBUILD_PYTHON_BINDINGS=OFF \
       -DBUILD_JAVA_BINDINGS=OFF \
       -DBUILD_CSHARP_BINDINGS=OFF \
       -DGDAL_BUILD_OPTIONAL_DRIVERS=OFF \
       -DOGR_BUILD_OPTIONAL_DRIVERS=OFF \
       -DGDAL_USE_CURL=ON \
       -DGDAL_USE_GEOS=OFF \
       -DGDAL_USE_EXPAT=ON \
       -DGDAL_USE_LIBXML2=OFF \
       -DGDAL_USE_SQLITE3=ON \
       -DGDAL_USE_ZLIB=ON \
       -DGDAL_USE_PNG=ON \
       -DGDAL_USE_JPEG=ON \
       -DGDAL_USE_WEBP=ON \
       -DGDAL_USE_OPENJPEG=ON \
       -DGDAL_USE_TIFF_INTERNAL=ON \
       -DGDAL_USE_GEOTIFF_INTERNAL=ON \
       -DGDAL_ENABLE_DRIVER_GTIFF=ON \
       -DGDAL_ENABLE_DRIVER_COG=ON \
       -DGDAL_ENABLE_DRIVER_ENVI=ON \
       -DGDAL_ENABLE_DRIVER_PNG=ON \
       -DGDAL_ENABLE_DRIVER_JPEG=ON \
       -DGDAL_ENABLE_DRIVER_WEBP=ON \
       -DGDAL_ENABLE_DRIVER_JP2OPENJPEG=ON \
       -DGDAL_ENABLE_DRIVER_HFA=ON \
       -DGDAL_ENABLE_DRIVER_VRT=ON \
       -DGDAL_ENABLE_DRIVER_XYZ=ON \
       -DGDAL_ENABLE_DRIVER_MBTILES=ON \
       -DOGR_ENABLE_DRIVER_GPKG=ON \
       -DOGR_ENABLE_DRIVER_GEOJSON=ON \
       -DOGR_ENABLE_DRIVER_GEOJSONSEQ=ON \
       -DOGR_ENABLE_DRIVER_FLATGEOBUF=ON \
       -DOGR_ENABLE_DRIVER_ESRI_SHAPEFILE=ON \
       -DOGR_ENABLE_DRIVER_KML=ON \
       -DOGR_ENABLE_DRIVER_MBTILES=ON \
       -DOGR_ENABLE_DRIVER_MVT=ON \
       -DGDAL_ENABLE_DRIVER_WMS=OFF \
       -DGDAL_ENABLE_DRIVER_WMTS=OFF \
    && cmake --build /tmp/gdal/build -j"$(nproc)" \
    && cmake --install /tmp/gdal/build \
    && rm -rf /tmp/gdal /tmp/gdal.tar.gz

FROM node:24.13.1-trixie-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ git libsqlite3-dev zlib1g-dev ca-certificates && rm -rf /var/lib/apt/lists/*
ARG TIPPECANOE_VERSION=2.79.0
RUN git clone --depth 1 --branch ${TIPPECANOE_VERSION} https://github.com/felt/tippecanoe.git /tmp/tippecanoe && make -C /tmp/tippecanoe -j2 && make -C /tmp/tippecanoe install
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build && npm prune --omit=dev

FROM node:24.13.1-trixie-slim
# Runtime libraries required by the pinned GDAL/PROJ build. No Debian gdal-bin.
RUN apt-get update && apt-get install -y --no-install-recommends \
      libsqlite3-0 zlib1g libpng16-16 libjpeg62-turbo libwebp7 \
      libopenjp2-7 libexpat1 libstdc++6 libcurl4t64 procps ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=gdal /usr/local/bin /usr/local/bin
COPY --from=gdal /usr/local/lib /usr/local/lib
COPY --from=gdal /usr/local/share/gdal /usr/local/share/gdal
COPY --from=gdal /usr/local/share/proj /usr/local/share/proj
RUN ldconfig
COPY --from=build /usr/local/bin/tippecanoe* /usr/local/bin/
# Tippecanoe upstream notices (BSD-2-Clause core and permissive bundled
# code), preserved into the runtime artifact for redistribution.
COPY --from=build /tmp/tippecanoe/LICENSE.md /usr/local/share/tippecanoe-notices/tippecanoe-LICENSE.md
COPY --from=build /tmp/tippecanoe/clipper2/LICENSE /usr/local/share/tippecanoe-notices/clipper2-LICENSE.txt
COPY --from=build /tmp/tippecanoe/mapbox/LICENSE-geometry.hpp /usr/local/share/tippecanoe-notices/mapbox-geometry.hpp-ISC.txt
COPY --from=build /tmp/tippecanoe/mapbox/LICENSE-variant /usr/local/share/tippecanoe-notices/mapbox-variant-BSD-2.txt
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY API.md openapi.yaml ./
COPY web ./web
COPY scripts ./scripts
RUN mkdir /data && chown node:node /data
USER node
ENV TILEO_DATA_DIR=/data NODE_ENV=production
EXPOSE 8090
CMD ["node", "dist/api.js"]
