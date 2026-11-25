import type { SourceBand } from '../encoded-options.js';
import { encodedUnitConversion, encodingPresets, type EncodingPreset } from '../encoded-presets.js';

const scalarNames = new Map([
  ['temp-2m', /(?:^|_)(?:t_?2m|2t|(?:air_)?temperature_(?:at_)?2_?m|2_?m_(?:air_)?temperature)(?:_|$)/],
  ['mslp', /(?:^|_)(?:pmsl|mslp|prmsl|msl|(?:air_)?pressure_at_mean_sea_level|mean_sea_level_pressure|pressure_reduced_to_mean_sea_level)(?:_|$)/],
  ['rh-2m', /(?:^|_)(?:relhum_2m|rh_2m|2r|relative_humidity_(?:at_)?2_?m|2_?m_relative_humidity)(?:_|$)/],
  ['precip-hourly', /(?:^|_)(?:precipitation_rate|rainfall_rate|precip_rate|rain_rate)(?:_|$)/],
  ['cape', /(?:^|_)(?:cape|convective_available_potential_energy)(?:_|$)/],
  ['cloud-cover', /(?:^|_)(?:clct|tcc|(?:total_)?cloud_(?:cover|fraction)|cloud_area_fraction)(?:_|$)/],
  ['wave-height', /(?:^|_)(?:swh|(?:significant_)?wave_height|sea_surface_wave_significant_height)(?:_|$)/],
]);

function bandRole(description = '') {
  const name = description.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  for (const [preset, pattern] of scalarNames) {
    if (pattern.test(name)) return { presets: [preset], index: 0, exact: true };
  }
  const u = /(?:^|_)(?:eastward_wind|zonal_wind|u_component_of_wind|u_?\d+_?(?:m|hpa)|10m_u)(?:_|$)/.test(name);
  const v = /(?:^|_)(?:northward_wind|meridional_wind|v_component_of_wind|v_?\d+_?(?:m|hpa)|10m_v)(?:_|$)/.test(name);
  if (u || v) {
    const surface = /(?:^|_)(?:[uv])?10_?m(?:_|$)/.test(name);
    const hasLevel = /(?:^|_)\d+_?(?:m|hpa)(?:_|$)/.test(name);
    return { presets: surface ? ['wind-surface'] : hasLevel ? ['wind-altitude'] : ['wind-surface', 'wind-altitude'], index: u ? 0 : 1, exact: surface || hasLevel };
  }
  const east = /(?:^|_)(?:eastward_(?:(?:ocean|sea_water)_)?(?:current|velocity)|uo)(?:_|$)/.test(name);
  const north = /(?:^|_)(?:northward_(?:(?:ocean|sea_water)_)?(?:current|velocity)|vo)(?:_|$)/.test(name);
  if (east || north) return { presets: ['ocean-currents'], index: east ? 0 : 1, exact: true };
  // Named fields with incompatible meaning must not be suggested by unit alone.
  if (/(?:^|_)(?:sea_surface_temperature|wind_speed|wind_gust|surface_pressure|precipitation_amount|tot_prec)(?:_|$)/.test(name)) {
    return { presets: [], index: 0, exact: false };
  }
}

export type BandControlChoice = { bands: SourceBand[]; suggested?: number };
export type PresetChoice = { id: string; preset: EncodingPreset; controls: BandControlChoice[] };

export function availableEncodingPresets(bands: SourceBand[]): PresetChoice[] {
  const valid = bands.filter(band => [band.scale, band.offset].every(Number.isFinite))
    .map(band => ({ band, role: bandRole(band.description) }));
  const choices: PresetChoice[] = [];
  for (const [id, preset] of encodingPresets) {
    const compatible = valid.filter(({ band }) => encodedUnitConversion(band.unit, preset.unit));
    const controls = preset.parameters.map((_, index) => {
      const known = compatible.filter(({ role }) => role?.index === index && role.presets.includes(id));
      const unknown = compatible.filter(({ role }) => !role);
      return {
        bands: [...known, ...unknown].map(({ band }) => band),
        suggested: known.length === 1 && known[0]!.role!.exact ? known[0]!.band.index : undefined,
      };
    });
    const [first, second] = controls;
    if (!first?.bands.length) continue;
    if (second && !first.bands.some(u => second.bands.some(v => v.index !== u.index))) continue;
    choices.push({ id, preset, controls });
  }
  return choices;
}
