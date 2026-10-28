ARG ALPINE_IMAGE=alpine:3.21@sha256:ee16d92f96db08d9d2d07da48555a27f3a69d8f0759021dbc601195ed0d2b5bd
FROM ${ALPINE_IMAGE} AS gdal
# Minimal, reproducible GDAL/PROJ profile on musl/Alpine.
# Bound native compiler concurrency for memory-limited WSL builders.
# Custom libcurl built from source with -DCURL_USE_LIBPSL=OFF -DUSE_LIBIDN2=OFF
# to eliminate copyleft closure (libidn2, libunistring, libpsl).
ARG GDAL_VERSION=3.11.4
ARG PROJ_VERSION=9.6.2
ARG CURL_VERSION=8.14.1
RUN apk add --no-cache \
      build-base cmake ninja ca-certificates curl \
      sqlite-dev zlib-dev libpng-dev libjpeg-turbo-dev \
      libwebp-dev openjpeg-dev expat-dev flatbuffers-dev \
      openssl-dev nghttp2-dev linux-headers

# Compile curl without libpsl or libidn2 (100% permissive runtime linkage: OpenSSL + nghttp2 + zlib)
RUN curl -fsSL "https://curl.se/download/curl-${CURL_VERSION}.tar.gz" -o /tmp/curl.tar.gz \
    && mkdir -p /tmp/curl && tar -xzf /tmp/curl.tar.gz -C /tmp/curl --strip-components=1 \
    && cmake -S /tmp/curl -B /tmp/curl/build -G Ninja \
       -DCMAKE_BUILD_TYPE=Release \
       -DCMAKE_INSTALL_PREFIX=/usr/local \
       -DBUILD_STATIC_LIBS=OFF \
       -DBUILD_CURL_EXE=OFF \
       -DBUILD_TESTING=OFF \
       -DCURL_USE_LIBPSL=OFF \
       -DUSE_LIBIDN2=OFF \
       -DCURL_USE_OPENSSL=ON \
       -DUSE_NGHTTP2=ON \
       -DCURL_ZLIB=ON \
    && cmake --build /tmp/curl/build --parallel 2 --target install \
    && rm -rf /tmp/curl /tmp/curl.tar.gz

# PROJ 9.6.2 for reprojection and EPSG lookups
RUN curl -fsSL "https://download.osgeo.org/proj/proj-${PROJ_VERSION}.tar.gz" -o /tmp/proj.tar.gz \
    && mkdir -p /tmp/proj && tar -xzf /tmp/proj.tar.gz -C /tmp/proj --strip-components=1 \
    && cmake -S /tmp/proj -B /tmp/proj/build -G Ninja \
       -DCMAKE_BUILD_TYPE=Release \
       -DCMAKE_INSTALL_PREFIX=/usr/local \
       -DCMAKE_PREFIX_PATH=/usr/local \
       -DBUILD_TESTING=OFF \
       -DBUILD_PROJSYNC=OFF \
       -DENABLE_TIFF=OFF \
       -DENABLE_CURL=ON \
       -DSQLITE3_INCLUDE_DIR=/usr/include \
       -DSQLITE3_LIBRARY=/usr/lib/libsqlite3.so \
    && cmake --build /tmp/proj/build --parallel 2 --target install \
    && rm -rf /tmp/proj /tmp/proj.tar.gz

# GDAL core: MIT-style. Drivers are limited to TileO's documented inputs:
# rasters (GeoTIFF/COG, ENVI, PNG, JPEG, WebP, JPEG2000, HFA/IMG, VRT, MBTiles,
# XYZ, Netpbm PNM/PPM/PGM via RAW, AAIGRID) and vectors (GeoJSON/Seq, GPKG, FlatGeobuf,
# ESRI Shapefile, KML, MBTiles).
RUN curl -fsSL "https://download.osgeo.org/gdal/${GDAL_VERSION}/gdal-${GDAL_VERSION}.tar.gz" -o /tmp/gdal.tar.gz \
    && mkdir -p /tmp/gdal && tar -xzf /tmp/gdal.tar.gz -C /tmp/gdal --strip-components=1 \
    && cmake -S /tmp/gdal -B /tmp/gdal/build -G Ninja \
       -DCMAKE_BUILD_TYPE=Release \
       -DCMAKE_INSTALL_PREFIX=/usr/local \
       -DCMAKE_PREFIX_PATH=/usr/local \
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
       -DGDAL_ENABLE_DRIVER_RAW=ON \
       -DGDAL_ENABLE_DRIVER_AAIGRID=ON \
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
    && cmake --build /tmp/gdal/build --parallel 2 --target install \
    && rm -rf /tmp/gdal /tmp/gdal.tar.gz

FROM ${ALPINE_IMAGE} AS build
ARG TIPPECANOE_VERSION=2.79.0
ARG NODE_VERSION=24.13.1
RUN apk add --no-cache build-base python3 make g++ git bash sqlite-dev zlib-dev ca-certificates curl

# Install Node.js linux-x64-musl into /usr/local
RUN curl -fsSL "https://unofficial-builds.nodejs.org/download/release/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64-musl.tar.xz" -o /tmp/node.tar.xz \
    && tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 \
    && rm /tmp/node.tar.xz

# Tippecanoe vector tile compressor
RUN git clone --depth 1 --branch ${TIPPECANOE_VERSION} https://github.com/felt/tippecanoe.git /tmp/tippecanoe \
    && make -C /tmp/tippecanoe -j2 \
    && make -C /tmp/tippecanoe install

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build && npm prune --omit=dev

FROM ${ALPINE_IMAGE} AS assemble-rootfs
ARG ALPINE_IMAGE
RUN apk add --no-cache \
      libstdc++ libgcc sqlite-libs zlib openssl nghttp2-libs \
      expat openjpeg libwebp libsharpyuv libpng libjpeg-turbo ca-certificates

RUN mkdir -p /rootfs/lib \
             /rootfs/usr/lib \
             /rootfs/usr/local/lib \
             /rootfs/usr/local/bin \
             /rootfs/usr/local/share \
             /rootfs/etc/ssl/certs \
             /rootfs/tmp \
             /rootfs/data \
             /rootfs/app \
             /rootfs/usr/local/share/tileo-build

RUN apk list --installed | sort > /rootfs/usr/local/share/tileo-build/apk-packages.txt \
    && printf '%s\n' "${ALPINE_IMAGE}" > /rootfs/usr/local/share/tileo-build/alpine-image.txt

# Dynamic linker and library search path
RUN cp -P /lib/ld-musl-x86_64.so.1 /rootfs/lib/ \
    && ln -sf ld-musl-x86_64.so.1 /rootfs/lib/libc.musl-x86_64.so.1 \
    && echo "/usr/local/lib:/usr/lib:/lib" > /rootfs/etc/ld-musl-x86_64.path

# Copy system shared libraries from alpine packages (all permissive / GCC Exception / public domain)
RUN cp -P /usr/lib/libstdc++.so* \
          /usr/lib/libgcc_s.so* \
          /usr/lib/libsqlite3.so* \
          /usr/lib/libz.so* \
          /usr/lib/libssl.so* \
          /usr/lib/libcrypto.so* \
          /usr/lib/libnghttp2.so* \
          /usr/lib/libexpat.so* \
          /usr/lib/libopenjp2.so* \
          /usr/lib/libwebp.so* \
          /usr/lib/libsharpyuv.so* \
          /usr/lib/libpng16.so* \
          /usr/lib/libjpeg.so* \
          /rootfs/usr/lib/

# Copy custom built libraries from gdal stage
COPY --from=gdal /usr/local/lib/libcurl.so* /rootfs/usr/local/lib/
COPY --from=gdal /usr/local/lib/libproj.so* /rootfs/usr/local/lib/
COPY --from=gdal /usr/local/lib/libgdal.so* /rootfs/usr/local/lib/

# Copy PROJ and GDAL share data
COPY --from=gdal /usr/local/share/proj /rootfs/usr/local/share/proj
COPY --from=gdal /usr/local/share/gdal /rootfs/usr/local/share/gdal

# Copy CA bundle
RUN cp /etc/ssl/certs/ca-certificates.crt /rootfs/etc/ssl/certs/ca-certificates.crt

# Copy Node binary and create symlink
COPY --from=build /usr/local/bin/node /rootfs/usr/local/bin/node
RUN mkdir -p /rootfs/bin && ln -sf /usr/local/bin/node /rootfs/bin/node

# Copy GDAL CLI binaries
COPY --from=gdal /usr/local/bin/gdalinfo \
                 /usr/local/bin/gdal_translate \
                 /usr/local/bin/gdalwarp \
                 /usr/local/bin/gdaladdo \
                 /usr/local/bin/ogrinfo \
                 /usr/local/bin/ogr2ogr \
                 /usr/local/bin/gdalsrsinfo \
                 /rootfs/usr/local/bin/

# Copy Tippecanoe CLI binaries
COPY --from=build /usr/local/bin/tippecanoe* /usr/local/bin/tile-join /rootfs/usr/local/bin/

# Copy Tippecanoe notices
COPY --from=build /tmp/tippecanoe/LICENSE.md /rootfs/usr/local/share/tippecanoe-notices/tippecanoe-LICENSE.md
COPY --from=build /tmp/tippecanoe/clipper2/LICENSE /rootfs/usr/local/share/tippecanoe-notices/clipper2-LICENSE.txt
COPY --from=build /tmp/tippecanoe/mapbox/LICENSE-geometry.hpp /rootfs/usr/local/share/tippecanoe-notices/mapbox-geometry.hpp-ISC.txt
COPY --from=build /tmp/tippecanoe/mapbox/LICENSE-variant /rootfs/usr/local/share/tippecanoe-notices/mapbox-variant-BSD-2.txt

# Copy application artifacts
COPY --from=build /app/node_modules /rootfs/app/node_modules
COPY --from=build /app/dist /rootfs/app/dist
COPY package.json package-lock.json API.md openapi.yaml /rootfs/app/
COPY web /rootfs/app/web
COPY scripts /rootfs/app/scripts
COPY THIRD-PARTY-NOTICES.md THIRD_PARTY_NOTICES.md /rootfs/app/
COPY third-party /rootfs/app/third-party
COPY baseline /rootfs/app/baseline

# Setup users, permissions, and directories
RUN echo "node:x:1000:1000:node:/app:/bin/false" > /rootfs/etc/passwd \
    && echo "node:x:1000:" > /rootfs/etc/group \
    && chmod 1777 /rootfs/tmp \
    && chown -R 1000:1000 /rootfs/data /rootfs/app

FROM scratch
COPY --from=assemble-rootfs /rootfs /
USER 1000:1000
WORKDIR /app
ENV PATH=/usr/local/bin:/usr/bin:/bin \
    LD_LIBRARY_PATH=/usr/local/lib:/usr/lib:/lib \
    PROJ_DATA=/usr/local/share/proj \
    GDAL_DATA=/usr/local/share/gdal \
    TILEO_DATA_DIR=/data \
    NODE_ENV=production
EXPOSE 8090
CMD ["node", "dist/api.js"]
