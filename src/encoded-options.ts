import { JobError } from './types.js';
import { encodedUnitConversion, encodingPresets } from './encoded-presets.js';

export function parseEncoding(value: Record<string, unknown>) {
  const preset = typeof value.preset === 'string' ? encodingPresets.get(value.preset) : undefined;
  if (value.preset !== undefined && !preset) throw new JobError('INVALID_OPTIONS', 'Unknown encoding preset.');
  const profile = value.profile === undefined ? preset?.profile : value.profile;
  if (profile !== 'rg-encoded' && profile !== 'rg-encoded-16bit' && profile !== 'r-encoded') throw new JobError('INVALID_OPTIONS', 'Choose a supported encoding profile.');
  if (preset && profile !== preset.profile) throw new JobError('INVALID_OPTIONS', 'Profile conflicts with the preset.');
  const count = profile === 'rg-encoded' ? 2 : 1;
  const bands = value.bands;
  if (!Array.isArray(bands) || bands.length !== count || !bands.every(band => Number.isSafeInteger(band) && band > 0) || new Set(bands).size !== count) {
    throw new JobError('INVALID_OPTIONS', `Choose ${count} distinct one-based band indices.`);
  }
  const range = value.unscale === undefined ? preset?.range : value.unscale;
  if (!Array.isArray(range) || range.length !== 2 || !range.every(Number.isFinite) || range[0] >= range[1] || !Number.isFinite(range[1] - range[0])) {
    throw new JobError('INVALID_OPTIONS', 'unscale must contain two increasing finite bounds with a finite span.');
  }
  const unit = value.unit === undefined ? preset?.unit : value.unit;
  if (typeof unit !== 'string' || !unit.trim() || unit.length > 80 || (preset && unit !== preset.unit)) {
    throw new JobError('INVALID_OPTIONS', 'Provide a target unit consistent with the preset.');
  }
  const parameters = value.parameters === undefined ? preset?.parameters : value.parameters;
  if (!Array.isArray(parameters) || parameters.length !== count || !parameters.every(label => typeof label === 'string' && label.trim() && label.length <= 100)) {
    throw new JobError('INVALID_OPTIONS', 'Provide one parameter label per selected band.');
  }
  return { profile, ...(preset ? { preset: value.preset as string } : {}), bands: bands as number[], unscale: range as [number, number], unit: unit.trim(), parameters: parameters as string[] };
}

export type EncodedOptions = ReturnType<typeof parseEncoding>;
export type SourceBand = { index: number; type: string; unit: string; scale: number; offset: number; noData?: number | string; maskFlags: string[]; description?: string };

export function resolveEncodedBands(options: EncodedOptions, source?: SourceBand[]) {
  return options.bands.map(index => {
    const band = source?.find(candidate => candidate.index === index);
    if (!band) throw new JobError('INVALID_ENCODED_SOURCE', `Band ${index} is unavailable or has an unsupported numeric type.`);
    if (![band.scale, band.offset].every(Number.isFinite)) throw new JobError('INVALID_ENCODED_SOURCE', `Band ${index} has an invalid scale or offset.`);
    const conversion = encodedUnitConversion(band.unit, options.unit);
    if (!conversion) throw new JobError('INVALID_ENCODED_SOURCE', `Band ${index} has missing, ambiguous or incompatible units for ${options.unit}.`);
    return { ...band, ...conversion };
  });
}
