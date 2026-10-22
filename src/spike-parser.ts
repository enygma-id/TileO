// Keep the historical spike entry point on the production parser so its
// regression tests cannot validate a different, obsolete implementation.
export { scanGeoJsonFeatures } from './vector-reader.js';
export interface IncrementalFeatureResult { raw: string; index: number }
export interface IncrementalGeoJsonOptions { maxFeatureBytes?: number }
