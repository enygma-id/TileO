import type { EncodedOptions } from './encoded-options.js';

type PixelEncoding = Pick<EncodedOptions, 'profile' | 'unscale'>;

export function quantize(value: number, [min, max]: [number, number], codes: number) {
  return Math.round(Math.max(0, Math.min(1, (value - min) / (max - min))) * codes);
}

export function decodeEncodedPixel(pixel: ArrayLike<number>, { profile, unscale: [min, max] }: PixelEncoding): number[] | null {
  if (pixel[3] !== 255) return null;
  const decode = (code: number, codes: number) => min + code / codes * (max - min);
  if (profile === 'rg-encoded-16bit') return [decode(pixel[0]! * 256 + pixel[1]!, 65535)];
  const r = decode(pixel[0]!, 255);
  return profile === 'rg-encoded' ? [r, decode(pixel[1]!, 255)] : [r];
}

export function interpolateEncodedPixels(samples: readonly (ArrayLike<number> | null)[], weights: readonly number[], encoding: PixelEncoding): number[] | null {
  const totals = encoding.profile === 'rg-encoded' ? [0, 0] : [0];
  let totalWeight = 0;
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i], weight = weights[i] ?? 0;
    if (!sample || weight <= 0) continue;
    const values = decodeEncodedPixel(sample, encoding);
    if (!values) continue;
    for (let component = 0; component < totals.length; component++) {
      totals[component] = totals[component]! + values[component]! * weight;
    }
    totalWeight += weight;
  }
  return totalWeight ? totals.map(total => total / totalWeight) : null;
}
