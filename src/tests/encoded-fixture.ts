import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { run } from '../process.js';

export async function cogFixture(dir: string) {
  const size = 256, world = 20037508.342789244;
  const bands = [
    { description: 'air_temperature_2m', unit: 'K', value: () => 100, transform: '<Scale>0.5</Scale><Offset>250</Offset>' },
    { unit: 'm', value: (x: number) => 255 + x % 2 },
    { description: 'eastward_wind_10m', unit: 'm/s', value: (x: number) => x === 42 ? -9999 : -50 },
    { description: 'northward_wind_10m', unit: 'm/s', value: (x: number) => x === 43 ? -9999 : 50 },
    { unit: '', value: () => 11 },
  ];
  let vrtBands = '';
  for (const [i, band] of bands.entries()) {
    const raw = Buffer.alloc(size ** 2 * 4);
    for (let j = 0; j < size ** 2; j++) raw.writeFloatLE(band.value(j % size), j * 4);
    await writeFile(join(dir, `b${i}.bin`), raw);
    vrtBands += `<VRTRasterBand dataType="Float32" band="${i + 1}" subClass="VRTRawRasterBand"><NoDataValue>-9999</NoDataValue><UnitType>${band.unit}</UnitType><Description>${band.description ?? ''}</Description>${band.transform ?? ''}<SourceFilename relativeToVRT="1">b${i}.bin</SourceFilename><ImageOffset>0</ImageOffset><PixelOffset>4</PixelOffset><LineOffset>${size * 4}</LineOffset><ByteOrder>LSB</ByteOrder></VRTRasterBand>`;
  }
  const vrt = join(dir, 'fixture.vrt'), cog = join(dir, 'multiband.tif'), scientific = join(dir, 'scientific.tif');
  await writeFile(vrt, `<VRTDataset rasterXSize="${size}" rasterYSize="${size}"><SRS>EPSG:3857</SRS><GeoTransform>${-world},${world / size},0,${world},0,${-world / size}</GeoTransform>${vrtBands}</VRTDataset>`);
  await run('gdal_translate', ['-of', 'COG', vrt, cog]);
  await run('gdal_translate', ['-of', 'COG', '-b', '1', cog, scientific]);
  const geographicVrt = join(dir, 'geographic.vrt'), geographic = join(dir, 'geographic.tif');
  const humidity = Buffer.alloc(size ** 2 * 4), mask = Buffer.alloc(size ** 2 * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4;
      humidity.writeFloatLE(x < size / 2 ? 0 : 100, offset);
      mask.writeFloatLE(x >= 64 && x < 128 ? 0 : 255, offset);
    }
  }
  await writeFile(join(dir, 'humidity.bin'), humidity);
  await writeFile(join(dir, 'mask.bin'), mask);
  const geographicBands = ['humidity', 'mask'].map((name, index) => `<VRTRasterBand dataType="Float32" band="${index + 1}" subClass="VRTRawRasterBand">${index === 0 ? '<UnitType>%</UnitType>' : ''}<SourceFilename relativeToVRT="1">${name}.bin</SourceFilename><ImageOffset>0</ImageOffset><PixelOffset>4</PixelOffset><LineOffset>${size * 4}</LineOffset><ByteOrder>LSB</ByteOrder></VRTRasterBand>`);
  await writeFile(geographicVrt, `<VRTDataset rasterXSize="${size}" rasterYSize="${size}"><SRS>EPSG:4326</SRS><GeoTransform>-180,${180 / size},0,85,0,${-85 / size}</GeoTransform>${geographicBands.join('')}</VRTDataset>`);
  await run('gdal_translate', ['-of', 'COG', '-b', '1', '-mask', '2', geographicVrt, geographic]);
  return { multiband: await readFile(cog), scientific: await readFile(scientific), geographic: await readFile(geographic) };
}
