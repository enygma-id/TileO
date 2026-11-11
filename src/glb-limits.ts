// Shared by browser inspection and the isolated backend converter.
export const GLB_MAX_JSON_BYTES = 64 * 1024 ** 2;

export function glbJsonSizeError(jsonBytes: number): string | undefined {
  if (jsonBytes > GLB_MAX_JSON_BYTES) {
    return `GLB JSON metadata is ${(jsonBytes / 1024 ** 2).toFixed(2)} MiB; the maximum is ${GLB_MAX_JSON_BYTES / 1024 ** 2} MiB.`;
  }
  return undefined;
}
