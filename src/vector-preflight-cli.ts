import { preflightGeoJson } from './vector-reader.js';
import { JobError } from './types.js';
import { writeSync } from 'node:fs';
try {
  const result = await preflightGeoJson(process.argv[2]!, JSON.parse(process.argv[3]!));
  writeSync(1, JSON.stringify({ result }));
} catch (error) {
  writeSync(1, JSON.stringify({ error: { code: error instanceof JobError ? error.code : 'INVALID_INPUT', message: (error as Error).message } }));
}
