export type EncodedProfile = 'rg-encoded' | 'rg-encoded-16bit' | 'r-encoded';

export interface EncodingPreset {
  label: string;
  profile: EncodedProfile;
  unit: string;
  range: [number, number];
  parameters: string[];
}

export const encodingPresets: ReadonlyMap<string, EncodingPreset> = new Map([
  ['temp-2m', { label: 'Temperature at 2 m', profile: 'rg-encoded-16bit', unit: '°C', range: [-50, 55], parameters: ['temperature'] }],
  ['wind-surface', { label: 'Wind at 10 m', profile: 'rg-encoded', unit: 'm/s', range: [-50, 50], parameters: ['eastward_wind', 'northward_wind'] }],
  ['wind-altitude', { label: 'Wind aloft', profile: 'rg-encoded', unit: 'm/s', range: [-100, 100], parameters: ['eastward_wind', 'northward_wind'] }],
  ['ocean-currents', { label: 'Ocean currents', profile: 'rg-encoded', unit: 'm/s', range: [-5, 5], parameters: ['eastward_current', 'northward_current'] }],
  ['mslp', { label: 'Mean sea-level pressure', profile: 'rg-encoded-16bit', unit: 'hPa', range: [870, 1085], parameters: ['mean_sea_level_pressure'] }],
  ['rh-2m', { label: 'Relative humidity', profile: 'r-encoded', unit: '%', range: [0, 100], parameters: ['relative_humidity'] }],
  ['precip-hourly', { label: 'Precipitation rate', profile: 'r-encoded', unit: 'mm/h', range: [0, 100], parameters: ['precipitation_rate'] }],
  ['cape', { label: 'CAPE', profile: 'r-encoded', unit: 'J/kg', range: [0, 5000], parameters: ['cape'] }],
  ['cloud-cover', { label: 'Cloud cover', profile: 'r-encoded', unit: '%', range: [0, 100], parameters: ['cloud_cover'] }],
  ['wave-height', { label: 'Wave height', profile: 'r-encoded', unit: 'm', range: [0, 20], parameters: ['wave_height'] }],
]);

function normalizeUnit(unit: string) {
  const aliases: Record<string, string> = { kelvin: 'k', celsius: '°c', degc: '°c', 'degree celsius': '°c', 'm s-1': 'm/s', 'm s^-1': 'm/s', 'mm h-1': 'mm/h', 'j kg-1': 'j/kg', percent: '%' };
  const key = unit.trim().toLowerCase();
  return Object.hasOwn(aliases, key) ? aliases[key] : key;
}

export function encodedUnitConversion(sourceUnit: string, targetUnit: string) {
  const from = normalizeUnit(sourceUnit), to = normalizeUnit(targetUnit);
  if (!from || ['unknown', 'undefined', 'n/a'].includes(from)) return undefined;
  if (from === to) return { unitFactor: 1, unitOffset: 0 };
  if (from === 'k' && to === '°c') return { unitFactor: 1, unitOffset: -273.15 };
  if (from === '°c' && to === 'k') return { unitFactor: 1, unitOffset: 273.15 };
  if (from === 'pa' && to === 'hpa') return { unitFactor: 0.01, unitOffset: 0 };
  if (from === 'hpa' && to === 'pa') return { unitFactor: 100, unitOffset: 0 };
  return undefined;
}
